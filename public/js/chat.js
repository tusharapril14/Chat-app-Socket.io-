const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector('input')
const $messageFormBtn = document.querySelector('button')
const $locationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}



const { displayName, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.on('msg', (message) => {
    html = Mustache.render($messageTemplate, {
        displayName:message.displayName,
        message: message.msg,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('geoLocation', (message) => {
    time = moment(message.createdAt).format('h:mm a')
    html = Mustache.render($locationTemplate, {
        displayName:message.displayName,
        location: message.msg,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    $messageFormBtn.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value
    socket.emit('incMsg', msg, () => {
        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log("Msg Delivered!");
    })
})

$locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('your browser does not support geolocation!')
    }
    $locationBtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(
        (position) => {
            socket.emit('geoLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $locationBtn.removeAttribute('disabled')
                console.log('Location Shared!')
            })
        })

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
socket.emit('join', {
    displayName,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

