/* exported MovingCostCalculator */
/* global AddressSearch, MovingVolumeCalculator, google */

/**
 * The AddressSearch class
 * @external AddressSearch
 * @see {@link https://zenoo.github.io/address-search/AddressSearch.html}
 */

 /**
 * The MovingVolumeCalculator class
 * @external MovingVolumeCalculator
 * @see {@link https://zenoo.github.io/moving-volume-calculator/MovingVolumeCalculator.html}
 */

/** MovingCostCalculator Class used to handle the MovingCostCalculator module */
class MovingCostCalculator{

	/**
     * Creates an instance of MovingCostCalculator
     * and checks for invalid parameters
	 * @param {(Element|String)} 					target                   				The wrapper for the MovingCostCalculator module
     * @param {Object}           					[parameters]            				Additional optional parameters
     * @param {String}           					[parameters.lang=en]     				The lang to use
     * @param {Boolean}           					[parameters.debug=false]     			Show debugging logs ?
     * @param {String}           					[parameters.googleAPIKey]     			Your Google API key (Only needed if the Google API script isn't imported before)
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
		
		this._loadDictionary();

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

		// MovingVolumeCalculator
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

		// Google Maps API
		const googleMapsAPIDependency = new Promise(solve => {
			if(window.google && window.google.maps){
				solve();
			}else{
				//Remove old script if it was here
				const gMapScript = document.querySelector('script[src^="https://maps.googleapis.com"]');

				if(gMapScript){
					gMapScript.remove();
					if(google) Reflect.deleteProperty(google, 'maps');
				}

				//Generate new Google Maps API script
				const newAPI = document.createElement('script');

				if(!this._parameters.googleAPIKey){
					throw new Error('MovingCostCalculator: You didn\'t provide your Google Maps API key. Please either pass it via the options\' googleAPIKey attribute OR import the Google Maps API script on your own.');
				}

				newAPI.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key='+this._parameters.googleAPIKey+'&language='+this._parameters.lang+'&callback=__mccGmapApiLoader';

				//Callback for the Google Maps API src
				window.__mccGmapApiLoader = () => {
					if(this._parameters.debug) console.log('DEPENDENCIES: Google Maps API script LOADED !');
					solve();
				};

				//Start the script
				document.querySelector('head').appendChild(newAPI);
			}
		});

		// AddressSearch
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

		return Promise.all([movingVolumeCalculatorDependency, googleMapsAPIDependency, addressSearchDependency]);
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
				title: 'Estimate your moving cost',
				addressesTitle: 'Your addresses',
				volumeTitle: 'Your volume',
				estimationsTitle: 'Estimations',
				departureAddress: 'Departure address',
				arrivalAddress: 'Arrival address',
				moreAddressOptions: 'More options'
			},
			fr: {
				title: 'Estimez le coût de votre déménagement',
				addressesTitle: 'Vos addresses',
				volumeTitle: 'Votre volume',
				estimationsTitle: 'Estimations',
				departureAddress: 'Adresse de départ',
				arrivalAddress: 'Adresse d\'arrivée',
				moreAddressOptions: 'Plus d\'options'
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

		let title = document.createElement('title'),
			section = document.createElement('section');

		/*
		 * Title
		 */
		title = document.createElement('h3');
		title.innerHTML = this._translated().title;
		this._wrapper.appendChild(title);

		/*
		 * Addresses
		 */
		this._buildAddresses();

		/*
		 * Volume
		 */
		section = document.createElement('section');
		section.classList.add('mcc-volume');
		this._wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().volumeTitle;
		section.appendChild(title);

		/*
		 * Loader
		 */
		section = document.createElement('section');
		section.classList.add('mcc-loader');
		this._wrapper.appendChild(section);

		/*
		 * Estimations
		 */
		section = document.createElement('section');
		section.classList.add('mcc-estimations');
		this._wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().estimationsTitle;
		section.appendChild(title);
	}

	/**
     * Builds the addresses module
     * @private
     */
    _buildAddresses(){
		let title = document.createElement('title'),
			section = document.createElement('section'),
			p = document.createElement('p'),
			input = document.createElement('input');

		section = document.createElement('section');
		section.classList.add('mcc-addresses');
		this._wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().addressesTitle;
		section.appendChild(title);

		p.innerText = this._translated().departureAddress;
		section.appendChild(p);

		section.appendChild(input);
		/**
		 * Departure address field
		 * @type {external:AddressSearch}
		 */
		this.departureAddress = new AddressSearch(input);

		p = document.createElement('p');
		p.innerText = this._translated().arrivalAddress;
		section.appendChild(p);

		input = document.createElement('input');
		section.appendChild(input);
		/**
		 * Arrival address field
		 * @type {external:AddressSearch}
		 */
		this.arrivalAddress = new AddressSearch(input);
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