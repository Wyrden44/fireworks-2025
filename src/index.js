const canvas = document.querySelector("#canvas")
if (!canvas) {
    throw new Error('Canvas element with id "canvas" not found in the DOM.')
}
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// constants
const gravity = 0.04
const drag = 0.996
const numFireworkParticles = 50
const maxParticleSpeed = 8
const maxParticleSize = 5
const maxDecayTime = 50

const maxRocketSpeed = 10
const maxRocketParticleSpeed = 4
const maxRocketParticleSize = 2
const maxRocketParticleDecay = 15
const rocketSparkColor = "#ebeb75ff"
const rocketSparkHighlightColor = "#fffec6ff"

const smallExplosionParticleSize = 3
const smallExplosionParticleSpeed = 4
const smallExlosionDecayTime = 30

const upwardExplosionParticleSize = 5
const upwardExplosionParticleSpeed = 5
const upwardExplosionDecayTime = 100

const sparkleColor = "#fffc9cff"
const starColor = "#fffc9cff"
const colors = [
    {
        color: "#db9b42",
        highlightColor: "#fffd96ff"
    },
    {
        color: "#c99700",
        highlightColor: "#fff3b0"
    },
    {
        color: "#ff7b00",
        highlightColor: "#ffd166"
    },
    {
        color: "#d62828",
        highlightColor: "#ffb703"
    },
    {
        color: "#9d4edd",
        highlightColor: "#e0aaff"
    },
    {
        color: "#3a86ff",
        highlightColor: "#bde0fe"
    },
    {
        color: "#2a9d8f",
        highlightColor: "#b7f0e3"
    }
]

class Particle {
    constructor(x, y, maxSpeed, directionRange=1, size, decay, color, highlightColor, ySpread=0.5) {
        this.x = x
        this.y = y
        this.size = size
        this.decay = decay
        this.maxSpeed = maxSpeed
        this.directionRange = directionRange
        this.color = color
        this.highlightColor = highlightColor
        this.ySpread = ySpread

        this.initialize()
    }

    initialize() {
        this.vx = (Math.random() - 0.5) * this.maxSpeed * this.directionRange
        this.vy = (Math.random() - this.ySpread) * this.maxSpeed
        this.maxSize = this.size
        this.maxDecay = this.decay
    }

    update() {
        this.vy += gravity
        this.vy = Math.min(this.vy, 10)
        this.vx = this.vx * drag
        this.vy = this.vy * drag

        this.x += this.vx
        this.y += this.vy

        this.decay--
        this.size = this.maxSize * (this.decay / this.maxDecay)
    }

    isLifeOver() {
        return this.decay <= 0
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2)
        ctx.fill()
        ctx.fillStyle = this.highlightColor
        ctx.beginPath()
        if (this.decay / this.maxDecay > 0.8)
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2)
        else
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI*2)
        ctx.fill()

    }
}

class Rocket {
    constructor(x, y, vx, vy) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.particles = []

        this.initialize()
    }

    initialize() {
        this.width = 5
        this.height = 20
        this.speed = maxRocketSpeed
        this.timeTillExplosion = ((this.y - ((Math.random() + 1) * 150))  / Math.abs(this.vy))
        this.color = "rgba(80, 60, 60)"
    }

    fly() {
        this.timeTillExplosion -= 1
        this.y += this.vy
        this.x += this.vx
        this.particles.forEach(particle => particle.update())
        this.particles = this.particles.filter(particle => !particle.isLifeOver())
        this.particles.push(new Particle(
            this.x + this.width / 2,
            this.y + this.height,
            maxRocketParticleSpeed,
            1,
            maxRocketParticleSize,
            maxRocketParticleDecay,
            rocketSparkColor,
            rocketSparkHighlightColor
        ))
    }

    hasExploded() {
        if (this.timeTillExplosion <= 0) {
            return true
        }
        return false
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        this.particles.forEach(particle => particle.draw())
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }
}

class SmallExlosion {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color

        this.particles = []

        this.initialize()
    }

    initialize() {
        for (let i=0; i<5; i++) {
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    smallExplosionParticleSpeed,
                    1,
                    Math.round((Math.random() + 0.1) * smallExplosionParticleSize),
                    smallExlosionDecayTime,
                    this.color.color,
                    this.color.highlightColor,
                )
            )
        }
    }

    isLifeOver() {
        return this.particles.length === 0
    }

    update() {
        this.particles.forEach(particle => particle.update())
        this.particles = this.particles.filter(particle => !particle.isLifeOver())
    }

    draw() {
        if (Math.random() > 0.5)
        this.particles.forEach(particle => particle.draw())
    }
}

class UpwardExplosion {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color

        this.particles = []

        this.initialize()
    }

    initialize() {
        for (let i=0; i<100; i++) {
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    upwardExplosionParticleSpeed,
                    0.08,
                    Math.round((Math.random() + 0.1) * upwardExplosionParticleSize),
                    upwardExplosionDecayTime,
                    this.color.color,
                    this.color.highlightColor,
                    1.5
                )
            )
        }
    }

    isLifeOver() {
        return this.particles.length === 0
    }

    update() {
        this.particles.forEach(particle => particle.update())
        this.particles = this.particles.filter(particle => !particle.isLifeOver())
    }

    draw() {
        this.particles.forEach(particle => particle.draw())
    }
}

class Explosion {
    constructor(x, y, color, addSparkles=false, addStars=false) {
        this.x = x
        this.y = y
        this.color = color
        this.addSparkles = addSparkles
        this.addStars = addStars
        this.particles = []
        this.sparkleParticles = []
        this.starParticles = []
        this.smallExplosions = []

        this.initialize()
    }

    initialize() {
        for (let i=0; i<numFireworkParticles; i++) {
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    maxParticleSpeed,
                    1,
                    Math.round((Math.random() + 0.1) * maxParticleSize),
                    maxDecayTime,
                    this.color.color,
                    this.color.highlightColor,
                )
            )
        }

        if (this.addSparkles) {
            for (let i=0; i<30; i++) {
                this.sparkleParticles.push(
                    new Particle(
                        this.x,
                        this.y,
                        maxParticleSpeed*1.2,
                        1,
                        Math.round((Math.random() + 0.1) * (maxParticleSize/2)),
                        maxDecayTime*1.5,
                        sparkleColor,
                        sparkleColor
                    )
                )
            }
        }

        if (this.addStars) {
            for (let i=0; i<5; i++) {
                this.starParticles.push(
                    new Particle(
                        this.x,
                        this.y,
                        maxParticleSpeed*1.5,
                        1,
                        1,
                        (Math.random() + 1) * (maxDecayTime / 2),
                        "#fff",
                        "#fff"
                    )
                )
            }
        }
    }

    update() {
        this.particles.forEach(particle => particle.update())
        this.particles = this.particles.filter(particle => !particle.isLifeOver())
        this.sparkleParticles.forEach(particle => particle.update())
        this.sparkleParticles = this.sparkleParticles.filter(particle => !particle.isLifeOver())
        
        if (this.addStars) {
            this.starParticles.forEach(particle => particle.update())
            this.smallExplosions.forEach(explosion => explosion.update())
            this.starParticles.forEach(particle => {
                if (particle.isLifeOver())
                    this.smallExplosions.push(
                        new SmallExlosion(particle.x, particle.y, starColor)
                    )
            }) 
            this.starParticles = this.starParticles.filter(particle => !particle.isLifeOver()) 
        }       
    }

    draw() {
        this.particles.forEach(particle => particle.draw())
        if (Math.random() > 0.3 && this.addSparkles)
        this.sparkleParticles.forEach(particle => particle.draw())

        if (this.addStars) {
            this.starParticles.forEach(particle => particle.draw())
            this.smallExplosions.forEach(explosion => explosion.draw())
        }
    }

    isLifeOver() {
        if (this.particles.length === 0 &&
            this.starParticles.length === 0 &&
            this.sparkleParticles.length === 0) {
                return true
            }
        return false
    }
}

class Firework {
    constructor(vx, vy, color, addSparkles, addStars) {
        this.vx = vx
        this.vy = vy
        this.color = color
        this.addSparkles = addSparkles
        this.addStars = addStars 

        this.initialize()
    }

    initialize() {
        this.stage = 1
        this.rocket = new Rocket(
            canvas.width / 2,
            canvas.height,
            this.vx,
            this.vy
        )
    }

    update() {
        if (this.stage == 1) {
            this.rocket.fly()
    
            if (this.rocket.hasExploded()) {
                this.stage = 2
                this.explosion = new Explosion(
                    this.rocket.getX(),
                    this.rocket.getY(),
                    this.color,
                    this.addSparkles,
                    this.addStars
                )
            }
        }
        else if (this.stage === 2) {
            this.explosion.update()

            if (this.explosion.isLifeOver()) {
                this.stage = 3
            }
        }
    }

    draw() {
        if (this.stage == 1) {
            this.rocket.draw()
        }
        else if (this.stage == 2) {
            this.explosion.draw()
        }
    }

    isLifeOver() {
        return this.stage === 3
    }
}

class Battery {
    constructor(effects) {
        this.x = canvas.width / 2
        this.y = canvas.height + 1
        this.effects = effects

        this.fireworks = []

        this.cooldown = 0

        this.initialize()
    }

    initialize() {
        this.next = this.effects.shift()
    }

    checkNext() {
        if (this.next && this.next.cooldown <= this.cooldown) {
            this.createAndAddFirework()
            if (this.effects) {
                this.next = this.effects.shift()
            }
            this.cooldown = 0
        }
    }

    createAndAddFirework() {
        for (const firework of this.next.fireworks) {
            switch (firework.type) {
                case "rocket":
                    this.fireworks.push(
                        new Firework(
                            firework.offset ? firework.offset : 0,
                            -maxRocketSpeed,
                            firework.color,
                            firework.addSparkles,
                            firework.addStars
                        )
                    )
                    break;
                case "upwardExplosion":
                    this.fireworks.push(
                        new UpwardExplosion(
                            this.x - firework.offset,
                            this.y + Math.abs(firework.offset),
                            firework.color,
                        )
                    )
                    break;
                default:
                    break;
            }
        }
    }

    update() {
        this.checkNext()

        this.fireworks.forEach(firework => firework.update())
    
        this.cooldown++
    }

    draw() {
        this.fireworks.forEach(firework => firework.draw())
    }
}

const effects = [
    {
        cooldown: 100,
        fireworks: [
            {
                type: "rocket",
                color: colors[0],
            }
        ]
    },
    {
        cooldown: 70,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true
            }
        ]
    },
    {
        cooldown: 120,
        fireworks: [
            {
                type: "rocket",
                color: colors[2],
                addSparkles: true,
                addStars: true
            }
        ]
    },
    {
        cooldown: 120,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
            }
        ]
    },
    {
        cooldown: 120,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: 1.5,
            }
        ]
    },
    {
        cooldown: 1,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true
            }
        ]
    },
    {
        cooldown: 1,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: -1.5
            }
        ]
    },
    {
        cooldown: 120,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                offset: 2,
            }
        ]
    },
    {
        cooldown: 1,
        fireworks: [
            {
                type: "rocket",
                color: colors[4],
            }
        ]
    },
    {
        cooldown: 1,
        fireworks: [
            {
                type: "rocket",
                color: colors[6],
                offset: -2,
            }
        ]
    },
    {
        cooldown: 150,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: 4
            }
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: 2
            }
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true
            }
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: -2
            }
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "rocket",
                color: colors[1],
                addSparkles: true,
                addStars: true,
                offset: -4
            }
        ]
    },
    {
        cooldown: 150,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 40
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -40
            },
        ]
    },
    {
        cooldown: 15,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true
            }
        ]
    },
    {
        cooldown: 200,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 40
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -40
            },
        ],
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 80
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -80
            },
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 120
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -120
            },
        ]
    },
    {
        cooldown: 15,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: -6
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: -4
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: -2
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: 2
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: 4
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[3],
                addSparkles: true,
                addStars: true,
                offset: 6
            }
        ]
    },
    {
        cooldown: 200,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 40
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -40
            },
        ],
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: 80
            },
            {
                type: "upwardExplosion",
                color: colors[1],
                offset: -80
            },
        ]
    },
    {
        cooldown: 50,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: 40
            },
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: -40
            },
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: 80
            },
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: -80
            },
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: 120
            },
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: -120
            },
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: 160
            },
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: -160
            },
        ]
    },
    {
        cooldown: 2,
        fireworks: [
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: 200
            },
            {
                type: "upwardExplosion",
                color: colors[3],
                offset: -200
            },
        ]
    },
    {
        cooldown: 15,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: -8
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: -6
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: -4
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: -2
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: 2
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: 4
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: 6
            }
        ]
    },
    {
        cooldown: 5,
        fireworks: [
            {
                type: "rocket",
                color: colors[5],
                addSparkles: true,
                addStars: true,
                offset: 8
            }
        ]
    }
]

const battery = new Battery(effects)


function loop() {
    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    battery.update()

    battery.draw()

    requestAnimationFrame(loop)
}

loop()
