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

 /**
 * The PlaceResult class from Google Places API
 * @external PlaceResult
 * @see {@link https://developers.google.com/maps/documentation/javascript/reference/3/places-service#PlaceResult}
 */

 /**
 * Translations object
 * @typedef Lang
 * @type {Object.<String, String>}
 * @memberof MovingCostCalculator
 * @example
 * {
 *   title: 'Estimate your moving cost',
 *   addressesTitle: 'Your addresses'
 * }
 */

 /**
 * Translations object list
 * @typedef Dictionary
 * @type {Object.<String, MovingCostCalculator.Lang>}
 * @memberof MovingCostCalculator
 * @example
 * {
 *   en: {
 *     title: 'Estimate your moving cost',
 *     addressesTitle: 'Your addresses'
 *   },
 *   fr: {
 *     title: 'Estimez le coût de votre déménagement',
 *     addressesTitle: 'Vos adresses'
 *   }
 * }
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
		 * Links to available elements
		 * @property {Element} 					wrapper 							The highest module element
		 * @property {Object} 					departure 							Holder for the departure elements
		 * @property {AddressSearch} 			departure.address 					Departure address AddressSearch
		 * @property {Object} 					departure.options 					Departure address options holder
		 * @property {Element} 					departure.options.floor	 			Departure address floor element
		 * @property {Element} 					departure.options.lift 				Departure address lift element
		 * @property {Element} 					departure.options.furnitureLift 	Departure address furniture lift element
		 * @property {Element} 					departure.options.porterageDistance Departure address porterage distance element
		 * @property {Object} 					arrival 							Holder for the arrival elements
		 * @property {AddressSearch} 			arrival.address 					Arrival address AddressSearch
		 * @property {Object} 					arrival.options 					Arrival address options holder
		 * @property {Element} 					arrival.options.floor 				Arrival address floor element
		 * @property {Element} 					arrival.options.lift 				Arrival address lift element
		 * @property {Element} 					arrival.options.furnitureLift 		Arrival address furniture lift element
		 * @property {Element} 					arrival.options.porterageDistance 	Arrival address porterage distance element
		 * @property {MovingVolumeCalculator} 	volume 								volume MovingVolumeCalculator
		 * @private
		 */
		this._elements = {
			wrapper: null,
			departure: {
				address: null,
				options: {
					floor: null,
					lift: null,
					furnitureLift: null,
					porterageDistance: null
				}
			},
			arrival: {
				address: null,
				options: {
					floor: null,
					lift: null,
					furnitureLift: null,
					porterageDistance: null
				}
			},
			volume: null
		};

        this._elements.wrapper = target instanceof Element ? target : document.querySelector(target);

        //Errors checking
        if(!this._elements.wrapper) throw new Error('MovingCostCalculator: '+(typeof target == 'string' ? 'The selector `'+target+'` didn\'t match any element.' : 'The element you provided was undefined'));
		if(this._elements.wrapper.classList.contains('mcc-wrapper')) throw new Error('MovingCostCalculator: The element has already been initialized.');

        /** @private */
		this._parameters = {
			lang: 'en',
			debug: false,
			...parameters
		};

		/**
		 * The calculator's available data
		 * @property {Object}  				addresses 									 	Addresses data
		 * @property {Object}  				addresses.departure 							Departure address data
		 * @property {external:PlaceResult} addresses.departure.value 					 	Address value
		 * @property {Object}  				addresses.departure.options 					Arrival address options
		 * @property {Number}  				addresses.departure.options.floor 			 	Address' floor
		 * @property {Boolean} 				addresses.departure.options.lift 			 	Does the address have a lift ?
		 * @property {Boolean} 				addresses.departure.options.furnitureLift 	 	Does the address require a furniture lift ?
		 * @property {Number}  				addresses.departure.options.porterageDistance 	The porterage distance approximate
		 * @property {Object}  				addresses.arrival 							 	Arrival address data
		 * @property {external:PlaceResult} addresses.arrival.value 						Address value
		 * @property {Object}  				addresses.arrival.options 					 	Departure address options
		 * @property {Number}  				addresses.arrival.options.floor 				Address' floor
		 * @property {Boolean} 				addresses.arrival.options.lift 				 	Does the address have a lift ?
		 * @property {Boolean} 				addresses.arrival.options.furnitureLift 		Does the address require a furniture lift ?
		 * @property {Number}  				addresses.arrival.options.porterageDistance 	The porterage distance approximate
		 * @property {Number}  				volume											The volume
		 * @property {Number}  				volumeData										The additional volume data
		 * @example
		 * {
		 *   addresses: {
		 *     departure: {
		 *       value: '',
		 *       options: {
		 *         floor: 0,
		 *         lift: false,
		 *         furnitureLift: false,
		 *         porterageDistance: 5
		 *       }
		 *     },
		 *     arrival: {
		 *       value: '',
		 *       options: {
		 *         floor: 0,
		 *         lift: false,
		 *         furnitureLift: false,
		 *         porterageDistance: 5
		 *       }
		 *     }
		 *   },
		 *   volume: 0,
		 *   volumeData: {}
		 * };
		 */
		this.data = {
			addresses: {
				departure: {
					value: '',
					options: {
						floor: 0,
						lift: false,
						furnitureLift: false,
						porterageDistance: 5
					}
				},
				arrival: {
					value: '',
					options: {
						floor: 0,
						lift: false,
						furnitureLift: false,
						porterageDistance: 5
					}
				}
			},
			volume: 0,
			volumeData: {}
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
				moreAddressOptions: 'More options',
				floor: 'Floor',
				lift: 'Lift',
				furnitureLift: 'Furniture Lift',
				porterageDistance: 'Porterage Distance',
				yes: 'Yes',
				no: 'No'
			},
			fr: {
				title: 'Estimez le coût de votre déménagement',
				addressesTitle: 'Vos addresses',
				volumeTitle: 'Votre volume',
				estimationsTitle: 'Estimations',
				departureAddress: 'Adresse de départ',
				arrivalAddress: 'Adresse d\'arrivée',
				moreAddressOptions: 'Plus d\'options',
				floor: 'Etage',
				lift: 'Ascenseur',
				furnitureLift: 'Monte-meubles',
				porterageDistance: 'Distance de portage',
				yes: 'Oui',
				no: 'Non'
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
		this._elements.wrapper.classList.add('mcc-wrapper');

		/*
		 * Title
		 */
		const title = document.createElement('h3');

		title.innerHTML = this._translated().title;
		this._elements.wrapper.appendChild(title);

		/*
		 * Addresses
		 */
		this._buildAddresses();

		/*
		 * Volume
		 */
		this._buildVolume();

		/*
		 * Contact
		 */
		this._buildContact();

		/*
		 * Loader
		 */
		this._buildLoader();

		/*
		 * Estimations
		 */
		this._buildEstimations();
	}

	/**
     * Builds the addresses module
     * @private
     */
    _buildAddresses(){
		let title = document.createElement('title'),
			section = document.createElement('section'),
			p = document.createElement('p'),
			input = document.createElement('input'),
			div = document.createElement('div');

		section = document.createElement('section');
		section.classList.add('mcc-addresses');
		this._elements.wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().addressesTitle;
		section.appendChild(title);

		// Departure
		p.innerText = this._translated().departureAddress;
		section.appendChild(p);

		section.appendChild(input);
		this._elements.departure.address = new AddressSearch(input);

		div.classList.add('mcc-address-options');
		section.appendChild(div);
		this._buildAddressOptions(this._elements.departure.options, div);

		// Arrival
		p = document.createElement('p');
		p.innerText = this._translated().arrivalAddress;
		section.appendChild(p);

		input = document.createElement('input');
		section.appendChild(input);
		this._elements.arrival.address = new AddressSearch(input);

		div = document.createElement('div');
		div.classList.add('mcc-address-options');
		section.appendChild(div);
		this._buildAddressOptions(this._elements.arrival.options, div);
	}

	/**
     * Builds the address' options
	 * @param {Object} options
	 * @param {Element} holder
     * @private
     */
	_buildAddressOptions(options, holder){
		Object.keys(options).forEach(option => {
			const p = document.createElement('p'),
				span = document.createElement('span');

			if(['lift', 'furnitureLift'].includes(option)){
				options[option] = document.createElement('select');

				let optionTag = document.createElement('option');

				optionTag.value = 'false';
				optionTag.innerText = this._translated().no;
				options[option].appendChild(optionTag);

				optionTag = document.createElement('option');
				optionTag.value = 'true';
				optionTag.innerText = this._translated().yes;
				options[option].appendChild(optionTag);
			}else{
				options[option] = document.createElement('input');
			}

			span.innerText = this._translated()[option];
			
			p.appendChild(span);
			p.appendChild(options[option]);
			holder.appendChild(p);
		});
	}

	/**
     * Builds the volume module
     * @private
     */
	_buildVolume(){
		let title = document.createElement('title'),
			section = document.createElement('section');
			

		section = document.createElement('section');
		section.classList.add('mcc-volume');
		this._elements.wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().volumeTitle;
		section.appendChild(title);

		const div = document.createElement('div');

		section.appendChild(div);
		this._elements.volume = new MovingVolumeCalculator(div);
	}

	/**
     * Builds the contact module
     * @private
     */
	_buildContact(){
		let section = document.createElement('section');

		section = document.createElement('section');
		section.classList.add('mcc-contact');
		this._elements.wrapper.appendChild(section);
	}

	/**
     * Builds the loader module
     * @private
     */
	_buildLoader(){
		let section = document.createElement('section');

		section = document.createElement('section');
		section.classList.add('mcc-loader');
		this._elements.wrapper.appendChild(section);
	}

	/**
     * Builds the estimations module
     * @private
     */
	_buildEstimations(){
		let title = document.createElement('title'),
			section = document.createElement('section');

		section = document.createElement('section');
		section.classList.add('mcc-estimations');
		this._elements.wrapper.appendChild(section);

		title = document.createElement('h4');
		title.innerHTML = this._translated().estimationsTitle;
		section.appendChild(title);
	}

	/**
     * Creates event listeners
     * @private
     */
    _listen(){
		/*
		 * Departure address
		 */
		this._elements.departure.address.onSelect(address => {
			this.data.departure.address = address;

			// Check if both addresses are full => enable next step
		});

		this._elements.departure.options.floor.addEventListener('change', () => {
			this.data.addresses.departure.options.floor = +this._elements.departure.options.floor.value;
		});

		this._elements.departure.options.lift.addEventListener('change', () => {
			this.data.addresses.departure.options.lift = this._elements.departure.options.lift.value == 'true';
		});

		this._elements.departure.options.furnitureLift.addEventListener('change', () => {
			this.data.addresses.departure.options.furnitureLift = this._elements.departure.options.furnitureLift.value == 'true';
		});
		
		this._elements.departure.options.porterageDistance.addEventListener('change', () => {
			this.data.addresses.departure.options.porterageDistance = +this._elements.departure.options.porterageDistance.value;
		});

		/*
		 * Arrival address
		 */
		this._elements.arrival.address.onSelect(address => {
			this.data.arrival.address = address;

			// Check if both addresses are full => enable next step
		});

		this._elements.arrival.options.floor.addEventListener('change', () => {
			this.data.addresses.arrival.options.floor = +this._elements.arrival.options.floor.value;
		});

		this._elements.arrival.options.lift.addEventListener('change', () => {
			this.data.addresses.arrival.options.lift = this._elements.arrival.options.lift.value == 'true';
		});

		this._elements.arrival.options.furnitureLift.addEventListener('change', () => {
			this.data.addresses.arrival.options.furnitureLift = this._elements.arrival.options.furnitureLift.value == 'true';
		});
		
		this._elements.arrival.options.porterageDistance.addEventListener('change', () => {
			this.data.addresses.arrival.options.porterageDistance = +this._elements.arrival.options.porterageDistance.value;
		});

		/*
		 * Volume
		 */
		this._elements.volume.onChange(value => {
			if(this._elements.volume.isValid()){
				this.data.volume = value;
				this.data.volumeData = this._elements.volume.data;

				// Enable next step
			}else{
				// Disable next step
			}
		}).onValidate(data => {
			this.data.volume = this._elements.volume.volume;
			this.data.volumeData = data;
			// Enable next step
		});
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
		this._elements.wrapper.innerHTML = '';
		this._elements.wrapper.classList.remove('mcc-wrapper');
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