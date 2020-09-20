const socket = io()
//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templetes
const messageTemplete = document.querySelector('#message-templete').innerHTML
const locationTemplete = document.querySelector('#location-templete').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-templete').innerHTML


//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild


    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(scrollOffset >= containerHeight - newMessageHeight) {
        $messages.scrollTop = $messages.scrollHeight 
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html  = Mustache.render(messageTemplete, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplete, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplete, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = $messageFormInput.value
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    socket.emit('sendMessage', message , (message) => {
        console.log(message)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('your broser do not support geolocation')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('location',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})


socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert('username is in use!')
        location.href = '/'
    }
})