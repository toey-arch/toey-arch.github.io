export default class InputController {
    constructor(camera_) {
        this.camera = camera_;
        this.initialize_();
    }

    initialize_() {
        this.canvas = document.querySelector("canvas");

        this.keys_ = {};

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
        this.canvas.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        this.canvas.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
        // canvas.addEventListener('click', async () => {
        //     if (!document.pointerLockElement) {
        //         await canvas.requestPointerLock({
        //             unadjustedMovement: true,
        //         })
        //     }
        // })
    }

    onMouseMove_(e) {
        if (document.pointerLockElement) {
            this.camera.rotation.y -= e.movementX/500;
            this.camera.rotation.x -= e.movementY/500;
            // if (this.previous_ === null) {
            //     this.previous_ = { ...this.current_ };
            // }

            // this.current_.mouseXDelta = e.movementX;
            // this.current_.mouseYDelta = e.movementY;
        }
    }

    async onMouseDown_(e) {
        if (!document.pointerLockElement) {
            await this.canvas.requestPointerLock({
                unadjustedMovement: true,
            })
        }

        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                
                break;
            }
            case 2: {
                
                break;
            }
        }
    }

    onMouseUp_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                
                break;
            }
            case 2: {
                
                break;
            }
        }
    }

    onKeyDown_(e) {
        if (document.pointerLockElement) {
            this.keys_[e.keyCode] = true;
        }
    }

    onKeyUp_(e) {
        this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys_[keyCode];
    }

    isReady() {
        return this.previous_ !== null;
    }

};