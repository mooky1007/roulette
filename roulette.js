class Roulette {
    constructor(el, config = {}, result = []) {
        this.el = document.querySelector(el);

        // DOM Elements
        this.roulette = this.el.querySelector('.roulette_screen .roulette_box');
        this.rouletteButton = this.el.querySelector('.center.btn');
        this.resultModal = this.el.querySelector('.modal');
        this.resultModalText = this.el.querySelector('.modal .result_text .prefix_text');
        this.resultModalTextPoint = this.el.querySelector('.modal .result_text .point_text');
        this.resultModalButton = this.el.querySelector('.modal button');

        // Roulette Config
        this.duration = config.duration || 3500;
        this.defaultSpin = config.defaultSpin || 4;
        this.offset = config.offset || 45;
        this.startPosition = config.startPosition || 0;
        this.exceptResult = config.exceptResult || [];

        // Roulette State
        this.rotatePos = 0;
        this.spin = false;
        this.modalStatus = false;

        // Roulette Result
        this.result = result;

        // Event Binding
        this.rouletteButton.addEventListener('click', () => this.start());
        this.resultModalButton.addEventListener('click', () => this.hideModal());
        window.addEventListener('keydown', (e) => {
            if(this.modalStatus){
                if(String(e.keyCode).match(/13|32|27/i)) this.hideModal();
            }else{
                if(String(e.keyCode).match(/13|32/i)) this.start();
            }
        });

        this.init();
    }

    init() {
        const { roulette, startPosition } = this;
        this.timer && clearTimeout(this.timer);

        roulette.style.cssText = `
            transition: none;
            transform: rotate(${startPosition}deg);
        `;

        this.hideModal();
    }

    start(fixedAmount) {
        if (this.spin) return;
        this.init();

        const { result, roulette, duration, defaultSpin, offset, exceptResult, getRangeRandom } = this;
        this.spin = true;

        this.timer = setTimeout(() => {
            this.rotatePos = (fixedAmount !== undefined 
                ? getRangeRandom(result[fixedAmount].range[0], result[fixedAmount].range[1])
                : Math.floor(Math.random() * 360)
            ) + (360 * defaultSpin) - offset;

            if(exceptResult.length > 0){
                let except = exceptResult.map(el => result[el].range);
                except.forEach(([start, end]) => {
                    if((this.rotatePos%360 + offset) >= start && (this.rotatePos%360 + offset) <= end){
                        const noneExcept = result.filter(({range}) => !except.includes(range));
                        const ranNumber = Math.floor(Math.random() * noneExcept.length);

                        this.rotatePos = getRangeRandom(noneExcept[ranNumber].range[0], noneExcept[ranNumber].range[1]) + (360 * defaultSpin) - offset;
                    }
                });
            }

            roulette.style.cssText = `
                transition: all ${duration}ms cubic-bezier(0, 0, 0, 1); 
                transform: rotate(${this.rotatePos}deg);
            `;

            this.getResult();
        }, 0);
    }

    getRangeRandom(min, max) {
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        return result;
    }

    getResult() {
        const { rotatePos, duration, result, offset } = this;
        const realPos = ((rotatePos % 360) + offset) % 360;

        this.timer = setTimeout(() => {
            result.forEach(({name, range : [start, end]}) => {
                if (start <= realPos && end >= realPos) {
                    this.renderModalText(name);
                    this.spin = false;
                    this.showModal();
                }
            });
        }, duration);
    }

    renderModalText(text) {
        this.resultModalTextPoint.innerHTML = text;
        this.resultModalText.innerHTML = text === '꽝!' ? '아쉽지만 다음 기회에...' : '축하합니다!';
    }

    showModal() {
        this.resultModal.classList.remove('hide');
        this.modalStatus = true;
    }

    hideModal() {
        this.resultModal.classList.add('hide');
        this.modalStatus = false;
    }
}
