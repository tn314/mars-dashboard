let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List([]),
    selectedRover: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (property, value) => { 
    store = store.set(property, value)
    render(root, store) 
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    const { rovers } = state.toJS()

    return `
        <header class="header">
            <nav class="header-nav wrapper mx-auto">
                ${Logo()}
                ${NavBar(rovers)}
            </nav>
        </header>

        <main>
            ${Content(state)}
        </main>

        ${Footer()}
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getRovers()
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Logo = () => {
    return `
        <a href="/#" class="logo">
            <img src="/assets/images/logo-mars-dashboard.svg" alt="Mars Dashboard" />
        </a>
    `
}

const LoopRovers = (rovers, callback) => {
    return rovers.map(callback()).join('')
}

const NavBar = (rovers) => {
    if (rovers) {
        return `
            <ul class="nav-items">
                ${LoopRovers(rovers, NavLink)}
            </ul>
        `
    }
}

const NavLink = (rover) => {
    return (rover) => `<li class="nav-item"><a class="nav-item-link" href='#${rover.slug}'>${rover.name}</a></li>`
}

const BackToHomeLink = () => `<a class="back-link" href='/#'>< Back</a>`

const Hero = (title, subtitle) => {
    return `
        <section class="hero">
            <header class="hero-content wrapper mx-auto">
                <h1 class="hero-title">${title}</h1>
                <h2 class="hero-subtitle">${subtitle}</h2>
            </header>
        </section>
    `
}

const Content = (state) => {
    return SelectMainContent(state)
}

const SelectMainContent = (state) => {
    let {apod, user, rovers, selectedRover} = state.toJS()
    let rover = rovers.find((rover) => selectedRover === rover.slug)
    return selectedRover.length ? RoverDetail(rover) : Index(user, apod, rovers)
}

const Index = (user, apod, rovers) => {
    return `
        ${Hero('Mars Dashboard', 'View the latest photos of your favorite mars rover')}
        <section>
            <div class="section wrapper mx-auto">
                ${Greeting(user.name)}
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
            </div>
            ${ImageOfTheDay(apod, ApodMediaType)}

            ${RoversListSection(rovers)}
        </section>
    `
}

const RoversListSection = (rovers) => {
    return `
        <section class="rovers-list-section">
            <div class="wrapper mx-auto">
                <header class="rovers-list-section-header">
                    <h2 class="rovers-list-section-title">MARS ROVERS</h2>
                    <p  class="rovers-list-section-subtitle">Select one rover to view photos</p>
                </header>
                ${RoversList(rovers)}
            </div>
        </section>
    `
}

const RoversList = (rovers) => {
    return `
        <ul class="rovers-list">
            ${LoopRovers(rovers, RoversListItem)}
        </ul>
    `
}

const RoversListItem = (rover) => {
    return (rover) => {
        return `
            <li class="rovers-list-item">
                <a class="rovers-list-item-link" href='#${rover.slug}'>
                    <span>
                        <span class="rovers-list-item-name">${rover.name}</span>
                        <span class="class="rovers-list-item-details-btn">View details</span>
                    </span>
                </a>
            </li>
        `
    }
}

const RoverDetail = (rover) => {
    return `
        ${Hero(rover.name, `Launch date: ${rover.launch_date} <br>Landing date: ${rover.landing_date}`)}

        <p class="back-to-home wrapper mx-auto">${BackToHomeLink()}</p>

        <div class="section wrapper mx-auto">
            <h3 class="section-title">${rover.name} rover info</h3>
            <p class="rover-detail-info"><strong>Launch date:</strong> ${rover.launch_date}<p>
            <p class="rover-detail-info"><strong>Landing date:</strong> ${rover.landing_date}<p>
            <p class="rover-detail-info"><strong>Status:</strong> ${rover.status}<p>
            <p class="rover-detail-info"><strong>Max date:</strong> ${rover.max_date}<p>
            <p class="rover-detail-info"><strong>Total photos:</strong> ${rover.total_photos}<p>
            <p class="rover-detail-info"><strong>Max Sol:</strong> ${rover.max_sol}<p>                                                
        </div>

        <div class="section wrapper mx-auto">
            <h3 class="section-title">PHOTOS</h3>
            <ul class="rover-detail-photos">${rover.photos.map((photo) => {
                return `
                    <li class="rover-detail-photo">
                        <div class="rover-detail-photo-wrapper">
                            <img src="${photo.img_src}" alt="${rover.name}" />
                        </div>
                        <span>Camera: ${photo.camera.full_name}</span>
                        <span>Taken: ${photo.earth_date}</span>
                    </li>
                `
            }).join('')}</ul>
        </div>
    `
}

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h2 class="section-title">Welcome, ${name}!</h2>
        `
    }

    return `
        <h2 class="section-title">Hello!</h2>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod, callback) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    //console.log(photodate.getDate(), today.getDate());

    //console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay()
    }

    return callback(apod)
}

const ApodMediaType = (apod) => {
    // check if the photo of the day is actually type video!
    if (apod.image && apod.image.media_type === "video") {
        return (`
            <div class="section wrapper mx-auto">
            <h3 class="apod-section-title">Astronomy Picture of the Day</h3>
            <p>See today's featured video <a target="_blank" href="${apod.image.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.copyright}</p>
            </div>
        `)
    } else {
        return (apod && apod.image) ?  (`
            <h3 class="apod-section-title wrapper mx-auto">Astronomy Picture of the Day</h3>
            <figure>
                <img src="${apod.image.url}" height="350px" width="100%" />
                <figcaption class="apod-figcaption wrapper mx-auto">${apod.image.title} &copy; ${apod.image.copyright}</figcaption>
            </figure>
            <div class="section wrapper mx-auto">
                <p>${apod.image.explanation}</p>
            </div>
        `) : ``
    }
}

const Footer = () => {
    return `
        <footer class="footer">
            <div class="wrapper mx-auto">
                <p>Mars Dashboard</p>
                <p>${new Date().getFullYear()}</p>
            </div>
        </footer>
    `
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => {
            updateStore('apod',  apod )
        })
}

const getRovers = () => {
    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(({rovers}) => {
            return Promise.all(rovers.map((rover) => {
                rover.slug = rover.name.toLowerCase();
                return fetch(`http://localhost:3000/rovers/${rover.slug}/photos/${rover.max_date}`)
                .then(res => res.json())
                .then(({photos}) => {
                    rover.photos = photos
                    return rover;
                });
            }));


        }).then((rovers) => updateStore('rovers', rovers ))
}

window.addEventListener("hashchange", function(e){
    let hash = window.location.hash;
    let selectedRover = hash.replace('#', '')
    updateStore('selectedRover', selectedRover);
});
