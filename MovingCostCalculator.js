/** MovingCostCalculator Class used to handle the MovingCostCalculator module */
class MovingCostCalculator{ //eslint-disable-line no-unused-vars

	/**
     * Creates an instance of MovingCostCalculator
     * and checks for invalid parameters
	 * @param {(Element|String)} 					target                   				The wrapper for the MovingCostCalculator module
     * @param {Object}           					[parameters]            				Additional optional parameters
     * @param {String}           					[parameters.lang=en]     				The lang to use
	 * @param {MovingCostCalculator.Dictionary}   	[parameters.dictionary]  				Adds custom translations to the dictionary
     */
    constructor(target, parameters){
        /** 
		 * The element in which the module will be placed
		 * @private 
		 */
        this._wrapper = target instanceof Element ? target : document.querySelector(target);

        //Errors checking
        if(!this._wrapper) throw new Error('MovingCostCalculator: '+(typeof target == 'string' ? 'The selector `'+target+'` didn\'t match any element.' : 'The element you provided was undefined'));
		if(this._wrapper.classList.contains('mcc-wrapper')) throw new Error('MovingCostCalculator: The element has already been initialized.');

        /** @private */
		this._parameters = {
			lang: 'en',
			debug: false,
			...parameters
		};

		this._loadDependencies().then(() => {
			if(this._parameters.debug) console.log('MovingCostCalculator: DEPENDENCIES LOADED !');

			this._build();
			this._listen();
		});
	}

	/**
	 * Loads the dependencies
	 * @returns {Promise} A Promise that resolves when all the dependencies are found or loaded
	 * @private
	 */
	_loadDependencies(){
		if(this._parameters.debug) console.log('MovingCostCalculator: LOADING DEPENDENCIES ...');

		const movingVolumeCalculatorDependency = new Promise(solve => {
			if(typeof MovingVolumeCalculator == 'function'){
				solve();
			}else{
				const movingVolumeCalculatorScript = new Promise(resolve => {
					this._loadResource('script', 'https://gitcdn.link/repo/Zenoo/moving-volume-calculator/master/MovingVolumeCalculator.min.js', () => {
						if(this._parameters.debug) console.log('DEPENDENCIES: MovingVolumeCalculator script LOADED !');
						resolve();
					});
				});
				const movingVolumeCalculatorStyle = new Promise(resolve => {
					this._loadResource('style', 'https://gitcdn.link/repo/Zenoo/moving-volume-calculator/master/MovingVolumeCalculator.min.css', () => {
						if(this._parameters.debug) console.log('DEPENDENCIES: MovingVolumeCalculator style LOADED !');
						resolve();
					});
				});

				Promise.all([movingVolumeCalculatorScript, movingVolumeCalculatorStyle]).then(() => {
					solve();
				});
			}
		});

		const addressSearchDependency = new Promise(solve => {
			if(typeof AddressSearch == 'function'){
				solve();
			}else{
				const addressSearchScript = new Promise(resolve => {
					this._loadResource('script', 'https://gitcdn.link/repo/Zenoo/address-search/master/address-search.min.js', () => {
						if(this._parameters.debug) console.log('DEPENDENCIES: AddressSearch script LOADED !');
						resolve();
					});
				});
				const addressSearchStyle = new Promise(resolve => {
					this._loadResource('style', 'https://gitcdn.link/repo/Zenoo/address-search/master/address-search.min.css', () => {
						if(this._parameters.debug) console.log('DEPENDENCIES: AddressSearch style LOADED !');
						resolve();
					});
				});

				Promise.all([addressSearchScript, addressSearchStyle]).then(() => {
					solve();
				});
			}
		});

		return Promise.all([movingVolumeCalculatorDependency, addressSearchDependency]);
	}

	/**
	 * Loads a resource
	 * @param {String} type 
	 * @param {String} url 
	 * @param {Function} callback 
	 * @private
	 */
	_loadResource(type, url, callback){
		const [head] = document.getElementsByTagName('head');

		if(type == 'script'){
			const script = document.createElement('script');
			
			script.src = url;
			script.onload = callback;
		
			head.appendChild(script);
		}else{
			const link = document.createElement('link');
			
			link.href = url;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.onload = callback;
		
			head.appendChild(link);
		}
	}

	/**
     * Loads the dictionary
     * @private
     */
    _loadDictionary(){
		/** @private */
		this._dictionary = {
			en: {
				
			},
			fr: {

			}
		};
		
		// Add custom translations
		this._dictionary = Object.assign(this._dictionary, this._parameters.dictionary || {});
	}
	
	/**
     * Builds the MovingVolumeCalculator DOM Tree inside the element
     * @private
     */
    _build(){
		this._wrapper.classList.add('mcc-wrapper');
	}

	/**
     * Creates event listeners
     * @private
     */
    _listen(){

	}

	/**
     * Returns the dictionnary for the current lang
	 * @returns {Object} The dictionnary for the current lang
     * @private
     */
    _translated(){
		return this._dictionary[this._parameters.lang];
	}

	/**
     * Sets the lang
	 * @param {String} lang The lang to set
	 * @returns {MovingCostCalculator} The current MovingCostCalculator
     */
    setLang(lang){
		this._parameters.lang = lang || 'en';

		return this;
	}

	/**
     * Removes any MovingCostCalculator mutation from the DOM
     */
    destroy(){
		this._wrapper.innerHTML = '';
		this._wrapper.classList.remove('mcc-wrapper');
	}

	/**
     * Removes any MovingCostCalculator mutation from the DOM
     * @param {String} selector The MovingCostCalculator wrapper selector
     * @static
     */
    static destroy(selector){
		const element = document.querySelector(selector);

		if(element && element.classList.contains('mcc-wrapper')){
			element.innerHTML = '';
			element.classList.remove('mcc-wrapper');
		}
	}
}