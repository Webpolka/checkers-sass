export const Swipe = (function () {
    function Swipe(element, options) {
        this.edge = options.edge;
        this.many = options.many;
        this.xDown = null;
        this.yDown = null;
        this.element = typeof (element) === 'string' ? document.querySelector(element) : element;
        this.element.addEventListener('touchstart', function (evt) {
            this.xDown = evt.touches[0].clientX;
            this.yDown = evt.touches[0].clientY;
        }.bind(this), false);
    }

    Swipe.prototype.onLeft = function (callback) {
        this.onLeft = callback;
        return this;
    };
    Swipe.prototype.onRight = function (callback) {
        this.onRight = callback;
        return this;
    };
    Swipe.prototype.onUp = function (callback) {
        this.onUp = callback;
        return this;
    };
    Swipe.prototype.onDown = function (callback) {
        this.onDown = callback;
        return this;
    };

    Swipe.prototype.handleTouchMove = function (evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }
        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;
        this.xDiff = this.xDown - xUp;
        this.yDiff = this.yDown - yUp;

        if (Math.abs(this.xDiff) !== 0) {
            if (this.xDiff > this.edge) {
                typeof (this.onLeft) === "function" && this.onLeft();
                console.log('left');
                
            } else if (this.xDiff < -this.edge) {
                typeof (this.onRight) === "function" && this.onRight();
                console.log('right');
            }
        }

        if (Math.abs(this.yDiff) !== 0) {
            if (this.yDiff > this.edge) {
                typeof (this.onUp) === "function" && this.onUp();
                console.log('up');
            } else if (this.yDiff < -this.edge) {
                typeof (this.onDown) === "function" && this.onDown();
                console.log('down');
            }
        }
        // Reset values.
        if (this.many) {
            this.xDown = xUp; this.yDown = yUp;           
        } else {
            this.xDown = null;
            this.yDown = null;
        }
    };

    Swipe.prototype.run = function () {
        this.element.addEventListener('touchmove', function (evt) {
            this.handleTouchMove(evt);
        }.bind(this), false);
    };

    return Swipe;
}());