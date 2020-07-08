root = window;

const defaults = {
    src: 'data-src',
    srcset: 'data-srcset',
    selector: '.lazyLoad',
    root: null,
    rootMargin: '0px',
    threshold: 0
}

const extend = function() {
    let extended = {};
    let deep = false;
    let i = 0;
    let length = arguments.length;

    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
    }

    let merge = function(obj) {
        for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    extended[prop] = extend(true, extended[prop], obj[prop]);
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    }

    for (; i < length; i++) {
        let obj = arguments[i];
        merge(obj);
    }

    return extended;
}

function LazyLoad(images, options) {
    this.settings = extend(defaults, options || {});
    this.images = images || document.querySelectorAll(this.settings.selector);
    this.observer = null;
    this.init();
}

LazyLoad.prototype = {
    init: function() {
        if (!root.IntersectionObserver) {
            this.loadImages();
            return;
        }

        let self = this;
        let observerConfig = {
            root: this.settings.root,
            rootMargin: this.settings.rootMargin,
            threshold: [this.settings.threshold]
        };

        this.observer = new IntersectionObserver(function(entries) {
            Array.prototype.forEach.call(entries, function(entry) {
                // isIntersecting 属性是重点，isIntersecting的时候加载，然后取消监听
                if (entry.isIntersecting) {
                    self.observer.unobserve(entry.target);
                    let src = entry.target.getAttribute(self.settings.src);
                    let srcset = entry.target.getAttribute(self.settings.srcset);
                    if ('img' === entry.target.tagName.toLowerCase()) {
                        if (src) {
                            entry.target.src = src;
                        }
                        if (srcset) {
                            entry.target.srcset = srcset;
                        }
                    }
                    else {
                        entry.target.style.backgroundImage = "url(" + src + ")";
                    }
                }
            })
        }, observerConfig);

        Array.prototype.forEach.call(this.images, function(image) {
            self.observer.observe(image);
        })
    },

    loadImages: function() {
        if (!this.settings) {
            return;
        }

        let self = this;
        Array.prototype.forEach.call(this.images, function(image) {
            let src = image.getAttribute(self.settings.src);
            let srcset = image.getAttribute(self.settings.srcset);
            if ('img' === image.tagName.toLowerCase()) {
                if (src) {
                    image.src = src;
                }
                if (srcset) {
                    image.srcset = srcset;
                }
            }
        })
    }
}

