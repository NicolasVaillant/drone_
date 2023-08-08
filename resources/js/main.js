const API_KEY = "f104317740713d28a62c8d7b7a8ac89b"
const checkbox = document.querySelector('#change-address')
const geolocation_toggle = document.querySelector('#geolocation-toggle')
const geolocation_button = document.querySelector('.geolocation')
const container_address = document.querySelector('.address')
const container_lat_long = document.querySelector('.lat-long')
const close_result = document.querySelector('.close-result')
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
            console.log(r)
        })
    }
    function error() {
        setTimeout(() => {
            e.target.checked = false
            geolocation_button.classList.add('shake')
            setTimeout(() => {
                geolocation_button.classList.remove('shake')
            }, 2000)
        }, 1000)
    }
})
const button = document.querySelector('.send-request')
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
        loadData(address_lat.value, address_long.value).then(r => {
            seeResult(r)
        })
    }else{
        //address
        if(address_text.value.length === 0){displayMessage("Données manquantes. Réessayer.", true, true);return}
        button.disabled = true
        geocoding(address_text.value).then(json => {
            if(json.length === 0){
                displayMessage("Aucun résultat. Réassayer.", true)
            }else{
                const data = json[0]
                displayMessage(`Résultat trouvé pour ${data.name}, ${data.state} (${data.country})`)
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
    })
})
const result = document.querySelector('.result')
const scrollable = document.querySelector('.scrollable')
const wrapper = document.querySelector('.wrapper')
close_result.addEventListener('click', (e) => {
    wrapper.classList.remove('see-result')
    result.classList.remove('see-result')
})
const check = document.querySelector('.check-condition')
const result_text = document.querySelector('.result-text')
const main_result = document.querySelector('.main-result')
const stats = document.querySelector('.stats')
const seeResult = (fr) => {
    let data = fr[0]
    console.log(data)
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
    var table = document.createElement('table');
    for (var i = 0; i < 6; i++) {
        var row = table.insertRow();
        for (var j = 0; j < 2; j++) {
            var cell = row.insertCell();
            cell.innerHTML = 'Ligne ' + (i + 1) + ', Colonne ' + (j + 1);
        }
    }
    stats.appendChild(table);
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
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},250&limit=1&appid=${API_KEY}`
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
            let minmax = min_t.toFixed(1) + '/' + max_t.toFixed(1);
            const icon = "http://openweathermap.org/img/wn/" + json.weather[0].icon + "@2x.png";
            temp_a.push({
                "name": json.name,
                "description": description,
                "minmax": minmax,
                "icon": icon,
                "wind": {
                    speed: json.wind.speed*3.6,
                    gust: json.wind.gust
                },
                "clouds": `${json.clouds.all}%`,
                "visibility":json.visibility
            })
            return temp_a
        })
        .catch(error => {
            console.warn(error.message)
        })
}