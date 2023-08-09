const API_KEY = ""
const checkbox = document.querySelector('#change-address')
const geolocation_toggle = document.querySelector('#geolocation-toggle')
const geolocation_button = document.querySelector('.geolocation')
const container_address = document.querySelector('.address')
const container_lat_long = document.querySelector('.lat-long')
const close_result = document.querySelector('.close-result')
window.onload = function () {}
checkbox.addEventListener('change', (e) => {
    if(e.target.checked){
        //lat-long
        container_lat_long.classList.remove('hidden')
        container_address.classList.add('hidden')
        address_text.value = ""
    }else{
        //address
        container_lat_long.classList.add('hidden')
        container_address.classList.remove('hidden')
        address_lat.value = ""
        address_long.value = ""
    }
})
geolocation_toggle.addEventListener('change', (e) => {
    if(e.target.checked){
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        loadData(latitude, longitude).then(r => {
            displayMessage(`Résultat trouvé pour <span>${r[0].name}</span>`)
            seeResult(r)
        })
    }
    function error() {
        setTimeout(() => {
            e.target.checked = false
            displayMessage("Erreur. Réessayer.", true, false)
        }, 1000)
    }
})
const button = document.querySelector('.send-request')
const icon_button = button.querySelector('i')
const address_text = document.querySelector('#address-text')
const address_lat = document.querySelector('#address-lat')
const address_long = document.querySelector('#address-long')
const error = document.querySelector('.error')
const form = document.querySelector('.form')
const input_change = document.querySelectorAll('.input-change')
button.disabled = true
button.addEventListener('click', () => {
    if(checkbox.checked){
        //lat-long
        if(address_lat.value.length === 0 || address_long.value.length === 0){displayMessage("Données manquantes. Réessayer.", true, true);return}
        button.disabled = true
        icon_button.classList.remove('hidden')
        loadData(address_lat.value, address_long.value).then(r => {
            displayMessage(`Résultat trouvé pour <span>${r[0].name}</span>`)
            seeResult(r)
        })
    }else{
        //address
        if(address_text.value.length === 0){displayMessage("Données manquantes. Réessayer.", true, true);return}
        button.disabled = true
        icon_button.classList.remove('hidden')
        geocoding(address_text.value).then(json => {
            if(json.length === 0){
                displayMessage("Aucun résultat. Réassayer.", true)
            }else{
                const data = json[0]
                displayMessage(`Résultat trouvé pour <span>${data.name}, ${data.state} (${data.country})</span>`)
                loadData(data.lat, data.lon).then(r => {
                    seeResult(r)
                })
            }
        })
    }
})
input_change.forEach(e => {
    e.addEventListener('keyup', (e) => {
        button.disabled = false
        icon_button.classList.add('hidden')
    })
})
const result = document.querySelector('.result')
const scrollable = document.querySelector('.scrollable')
const wrapper = document.querySelector('.wrapper')
close_result.addEventListener('click', (e) => {
    error.parentElement.classList.add('hide')
    wrapper.classList.remove('see-result')
    result.classList.remove('see-result')
    geolocation_toggle.checked = false
    icon_button.classList.add('hidden')
})
const check = document.querySelector('.check-condition')
const result_text = document.querySelector('.result-text')
const main_result = document.querySelector('.main-result')
const stats = document.querySelector('.stats')
const seeResult = (fr) => {
    let data = fr[0]
    wrapper.classList.add('see-result')
    result.classList.add('see-result')
    if(data.wind.speed >= 50 || ((data.wind.gust !== undefined || data.wind.gust !== 'undefined') && data.wind.gust >= 50) ){
        check.classList.add('fa-times')
        result_text.innerHTML = 'Les conditions sont défavorables.'
        main_result.classList.add('stay-at-home')
    }else{
        check.classList.add('fa-circle-check')
        result_text.innerHTML = 'Les conditions sont favorables.'
        main_result.classList.add('go-for-it')
    }
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`.${key}`)
        if(element !== null){
            if(key === 'icon'){
                element.src = value.toString()
            }else{
                element.innerHTML = value.toString()
            }
            if(key === 'wind'){
                element.innerHTML = `${value.speed.toString()} km/h, ${value.gust.toString()} km/h`;
            }
        }
    });
}
const displayMessage = (msg, errorState = false, shake = false) => {
    if(shake){
        form.classList.add('shake')
         setTimeout(() => {
            form.classList.remove('shake')
        }, 2000)
    }
    if(errorState){
        error.parentElement.classList.add('error')
        setTimeout(() => {
            error.parentElement.classList.add('hide')
            error.parentElement.classList.remove('error')
        }, 3000)
    }
    error.parentElement.classList.remove('hide')
    error.innerHTML = msg
}
const loadData = async(lat, long) => {
    address_text.value = ""
    address_lat.value = ""
    address_long.value = ""
    return await openweathermap(lat, long)
}
const geocoding = async function (city){
    let temp_a = []
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city},250&limit=1&appid=${API_KEY}`
    console.log(url)
    return await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            return json
        })
}
const openweathermap = function (lat, long){
    let temp_a = []
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&lang=fr&units=metric&appid=${API_KEY}`
    return fetch(url)
        .then((response) => response.json())
        .then((json) => {
            let description = json.weather[0].description.charAt(0).toUpperCase() + json.weather[0].description.slice(1)
            let min_t = json.main.temp_min;
            let max_t = json.main.temp_max;
            let minmax = `${min_t.toFixed(1)}°C/${max_t.toFixed(1)}°C`;
            const icon = "https://openweathermap.org/img/wn/" + json.weather[0].icon + "@2x.png";
            temp_a.push({
                "name": json.name,
                "description": description,
                "minmax": minmax,
                "icon": icon,
                "wind": {
                    speed: (json.wind.speed !== undefined ? (json.wind.speed*3.6).toFixed(2) : 'Ø'),
                    gust: (json.wind.gust !== undefined ? json.wind.gust.toFixed(2) : 'Ø')
                },
                "clouds": `${json.clouds.all}%`,
                "visibility":json.visibility/1000
            })
            return temp_a
        })
        .catch(error => {
            console.warn(error.message)
        })
}
