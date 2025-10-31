class Sprite {
    constructor({position, velocity, image}) {
        this.position = position;
        this.image = image;
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y);

    }
}