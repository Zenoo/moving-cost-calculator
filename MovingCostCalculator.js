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
			...parameters
		};

		this._build();
        this._listen();
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