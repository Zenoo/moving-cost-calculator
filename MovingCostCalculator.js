/* exported MovingCostCalculator */
/* global AddressSearch, MovingVolumeCalculator, AjaxSender, google */

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
	 * @param {(Element|String)} 					target                   					The wrapper for the MovingCostCalculator module
     * @param {Object}           					[parameters]            					Additional optional parameters
     * @param {String}           					[parameters.lang=en]     					The lang to use
     * @param {Boolean}           					[parameters.debug=false]     				Show debugging logs ?
     * @param {String}           					[parameters.remoteCalculator]     			URL to use for a remote calculation
     * @param {String}           					[parameters.googleAPIKey]     				Your Google API key (Only needed if the Google API script isn't imported before)
     * @param {Boolean}           					[parameters.askForContact]     				Should the calculator ask for a mail before giving the results ?
	 * @param {MovingCostCalculator.Dictionary}   	[parameters.dictionary]  					Adds custom translations to the dictionary
	 * @param {Object}   							[parameters.options]  						Options to enable/disable
	 * @param {Boolean}   							[parameters.options.floor=true]  			Ask for floor ?
	 * @param {Boolean}   							[parameters.options.lift=true]  			Ask for lift ?
	 * @param {Boolean}   							[parameters.options.porterageDistance=true] Ask for porterage distance ?
	 * @param {MovingVolumeCalculator.Rooms}   		[parameters.options.rooms]  				Custom rooms
     */
    constructor(target, parameters){
		/**
		 * Links to available elements
		 * @property {Element} 					wrapper 							The highest module element
		 * @property {Object} 					departure 							Holder for the departure elements
		 * @property {AddressSearch} 			departure.address 					Departure address AddressSearch
		 * @property {Element} 					departure.optionToggler 			Departure address options toggler element
		 * @property {Object} 					departure.options 					Departure address options holder
		 * @property {Element} 					departure.options.floor	 			Departure address floor element
		 * @property {Element} 					departure.options.lift 				Departure address lift element
		 * @property {Element} 					departure.options.porterageDistance Departure address porterage distance element
		 * @property {Object} 					arrival 							Holder for the arrival elements
		 * @property {AddressSearch} 			arrival.address 					Arrival address AddressSearch
		 * @property {Element} 					arrival.optionToggler 				Arrival address options toggler element
		 * @property {Object} 					arrival.options 					Arrival address options holder
		 * @property {Element} 					arrival.options.floor 				Arrival address floor element
		 * @property {Element} 					arrival.options.lift 				Arrival address lift element
		 * @property {Element} 					arrival.options.porterageDistance 	Arrival address porterage distance element
		 * @property {MovingVolumeCalculator} 	volume 								volume MovingVolumeCalculator
		 * @property {Element} 					contact 							Contact element
		 * @property {Object} 					validation 							Holder for the validation buttons
		 * @property {Object} 					validation.addresses 				Addresses validation
		 * @property {Object} 					validation.contact 					Contact validation
		 * @private
		 */
		this._elements = {
			wrapper: null,
			departure: {
				address: null,
				optionToggler: null,
				options: {
					floor: null,
					lift: null,
					porterageDistance: null
				}
			},
			arrival: {
				address: null,
				optionToggler: null,
				options: {
					floor: null,
					lift: null,
					porterageDistance: null
				}
			},
			volume: null,
			contact: null,
			validation: {
				addresses: null,
				contact: null
			}
		};

        this._elements.wrapper = target instanceof Element ? target : document.querySelector(target);

        //Errors checking
        if(!this._elements.wrapper) throw new Error('MovingCostCalculator: '+(typeof target == 'string' ? 'The selector `'+target+'` didn\'t match any element.' : 'The element you provided was undefined'));
		if(this._elements.wrapper.classList.contains('mcc-wrapper')) throw new Error('MovingCostCalculator: The element has already been initialized.');

        /** @private */
		this._parameters = {
			lang: 'en',
			debug: false,
			askForContact: true,
			...parameters,
			options: {
				floor: true,
				lift: true,
				porterageDistance: true,
				...parameters.options
			}
		};

		/**
		 * The calculator's available data
		 * @property {Object}  				addresses 									 	Addresses data
		 * @property {Object}  				addresses.departure 							Departure address data
		 * @property {external:PlaceResult} addresses.departure.value 					 	Address value
		 * @property {Object}				addresses.departure.components 					Address components
		 * @property {String} 				addresses.departure.components.streetNumber 	Address' street number
		 * @property {String} 				addresses.departure.components.route 			Address' route
		 * @property {String} 				addresses.departure.components.zipCode 			Address' zip code
		 * @property {String} 				addresses.departure.components.locality 		Address' locality
		 * @property {String} 				addresses.departure.components.country 			Address' country
		 * @property {String} 				addresses.departure.components.countryCode 		Address' country code
		 * @property {String} 				addresses.departure.components.department 		Address' department
		 * @property {String} 				addresses.departure.components.region 			Address' region
		 * @property {Number} 				addresses.departure.location.lat 				Address' latitude
		 * @property {Number} 				addresses.departure.location.lng 				Address' longitude
		 * @property {String} 				addresses.departure.location.placeId 			Address' place ID
		 * @property {Object}  				addresses.departure.options 					Arrival address options
		 * @property {Number}  				addresses.departure.options.floor 			 	Address' floor
		 * @property {Boolean} 				addresses.departure.options.lift 			 	Does the address have a lift ?
		 * @property {Number}  				addresses.departure.options.porterageDistance 	The porterage distance approximate
		 * @property {Object}  				addresses.arrival 							 	Arrival address data
		 * @property {external:PlaceResult} addresses.arrival.value 						Address value
		 * @property {Object}				addresses.arrival.components 					Address components
		 * @property {String} 				addresses.arrival.components.streetNumber 		Address' street number
		 * @property {String} 				addresses.arrival.components.route 				Address' route
		 * @property {String} 				addresses.arrival.components.zipCode 			Address' zip code
		 * @property {String} 				addresses.arrival.components.locality 			Address' locality
		 * @property {String} 				addresses.arrival.components.country 			Address' country
		 * @property {String} 				addresses.arrival.components.countryCode 		Address' country code
		 * @property {String} 				addresses.arrival.components.department 		Address' department
		 * @property {String} 				addresses.arrival.components.region 			Address' region
		 * @property {Number} 				addresses.arrival.location.lat 					Address' latitude
		 * @property {Number} 				addresses.arrival.location.lng 					Address' longitude
		 * @property {String} 				addresses.arrival.location.placeId 				Address' place ID
		 * @property {Object}  				addresses.arrival.options 					 	Departure address options
		 * @property {Number}  				addresses.arrival.options.floor 				Address' floor
		 * @property {Boolean} 				addresses.arrival.options.lift 				 	Does the address have a lift ?
		 * @property {Number}  				addresses.arrival.options.porterageDistance 	The porterage distance approximate
		 * @property {Number}  				volume											The volume
		 * @property {Number}  				volumeData										The additional volume data
		 * @property {String}  				contact											The user's mail
		 * @example
		 * {
		 *   addresses: {
		 *     departure: {
		 *       value: '',
		 *       components: {
		 *         streetNumber: '',
		 *         route: '',
		 *         zipCode: '',
		 *         locality: '',
		 *         country: '',
		 *         countryCode: '',
		 *         department: '',
		 *         region: ''
		 *       },
		 *       location:{
		 *         lat: 0,
		 *         lng: 0,
		 *         placeId: ''
		 *       },
		 *       options: {
		 *         floor: 0,
		 *         lift: false,
		 *         porterageDistance: 0
		 *       }
		 *     },
		 *     arrival: {
		 *       value: '',
		 *       components: {
		 *         streetNumber: '',
		 *         route: '',
		 *         zipCode: '',
		 *         locality: '',
		 *         country: '',
		 *         countryCode: '',
		 *         department: '',
		 *         region: ''
		 *       },
		 *       location:{
		 *         lat: 0,
		 *         lng: 0
		 *         placeId: ''
		 *       },
		 *       options: {
		 *         floor: 0,
		 *         lift: false,
		 *         porterageDistance: 0
		 *       }
		 *     }
		 *   },
		 *   volume: 0,
		 *   volumeData: {},
		 *   contact: ''
		 * };
		 */
		this.data = {
			addresses: {
				departure: {
					value: '',
					components: {
						streetNumber: '',
						route: '',
						zipCode: '',
						locality: '',
						country: '',
						countryCode: '',
						department: '',
						region: ''
					},
					location: {
						lat: 0,
						lng: 0,
						placeId: ''
					},
					options: {
						floor: 0,
						lift: false,
						porterageDistance: 0
					}
				},
				arrival: {
					value: '',
					components: {
						streetNumber: '',
						route: '',
						zipCode: '',
						locality: '',
						country: '',
						countryCode: '',
						department: '',
						region: ''
					},
					location: {
						lat: 0,
						lng: 0,
						placeId: ''
					},
					options: {
						floor: 0,
						lift: false,
						porterageDistance: 0
					}
				}
			},
			volume: 0,
			volumeData: {},
			contact: ''
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
				const gMapScripts = document.querySelectorAll('script[src^="https://maps.googleapis.com"]');

				if(gMapScripts.length){
					gMapScripts.forEach(gMapScript => {
						gMapScript.remove();
					});
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

		// AjaxSender
		const ajaxSenderDependency = new Promise(solve => {
			if(typeof AjaxSender == 'function'){
				solve();
			}else{
				const ajaxSenderScript = new Promise(resolve => {
					this._loadResource('script', 'https://gitcdn.link/repo/Zenoo/ajax-sender/1d834e01a9ffa3965d4a6adb2eade9f3d084e517/AjaxSender.min.js', () => {
						if(this._parameters.debug) console.log('DEPENDENCIES: AjaxSender script LOADED !');
						resolve();
					});
				});

				ajaxSenderScript.then(() => {
					solve();
				});
			}
		});

		return Promise.all([movingVolumeCalculatorDependency, googleMapsAPIDependency, addressSearchDependency, ajaxSenderDependency]);
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
				lessAddressOptions: 'Less options',
				floor: 'Floor',
				lift: 'Lift',
				porterageDistance: 'Porterage Distance',
				yes: 'Yes',
				no: 'No',
				enterContact: 'Please enter your mail to access your estimations',
				loading: 'Loading ...',
				next: 'Next'
			},
			fr: {
				title: 'Estimez le coût de votre déménagement',
				addressesTitle: 'Vos addresses',
				volumeTitle: 'Votre volume',
				estimationsTitle: 'Estimations',
				departureAddress: 'Adresse de départ',
				arrivalAddress: 'Adresse d\'arrivée',
				moreAddressOptions: 'Plus d\'options',
				lessAddressOptions: 'Moins d\'options',
				floor: 'Etage',
				lift: 'Ascenseur',
				porterageDistance: 'Distance de portage',
				yes: 'Oui',
				no: 'Non',
				enterContact: 'Veuillez renseigner votre adresse mail pour accéder à vos estimations',
				loading: 'Chargement ...',
				next: 'Suivant'
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
		if(this._parameters.askForContact) this._buildContact();

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
		let title = document.createElement('h4'),
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

		// Departure options toggler
		if(Object.values(this._parameters.options).some(option => option == true)){
			p = document.createElement('p');
			p.classList.add('mcc-address-options-toggler');
			section.appendChild(p);
	
			this._elements.departure.optionToggler = document.createElement('a');
			this._elements.departure.optionToggler.classList.add('mcc-address-options-enable');
			this._elements.departure.optionToggler.innerText = this._translated().moreAddressOptions;
			this._elements.departure.optionToggler.href = '';
			p.appendChild(this._elements.departure.optionToggler);
	
			// Departure options
			div.classList.add('mcc-address-options', 'mcc-departure', 'mcc-hidden');
			section.appendChild(div);
			this._buildAddressOptions(this._elements.departure.options, div);
		}
		
		// Arrival
		p = document.createElement('p');
		p.innerText = this._translated().arrivalAddress;
		section.appendChild(p);

		input = document.createElement('input');
		section.appendChild(input);
		this._elements.arrival.address = new AddressSearch(input);

		// Arrival options toggler
		if(Object.values(this._parameters.options).some(option => option == true)){
			p = document.createElement('p');
			p.classList.add('mcc-address-options-toggler');
			section.appendChild(p);
	
			this._elements.arrival.optionToggler = document.createElement('a');
			this._elements.arrival.optionToggler.classList.add('mcc-address-options-enable');
			this._elements.arrival.optionToggler.innerText = this._translated().moreAddressOptions;
			this._elements.arrival.optionToggler.href = '';
			p.appendChild(this._elements.arrival.optionToggler);
	
			// Arrival options
			div = document.createElement('div');
			div.classList.add('mcc-address-options', 'mcc-arrival', 'mcc-hidden');
			section.appendChild(div);
			this._buildAddressOptions(this._elements.arrival.options, div);
		}
		

		// Validation
		p = document.createElement('p');
		this._elements.validation.addresses = document.createElement('button');
		this._elements.validation.addresses.disabled = true;
		this._elements.validation.addresses.innerHTML = this._translated().next;
		p.appendChild(this._elements.validation.addresses);
		section.appendChild(p);
	}

	/**
     * Builds the address' options
	 * @param {Object} options
	 * @param {Element} holder
     * @private
     */
	_buildAddressOptions(options, holder){
		Object.keys(options).forEach(option => {
			if(this._parameters.options[option]){
				const p = document.createElement('p'),
				span = document.createElement('span');

				if(['lift'].includes(option)){
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
			}
		});
	}

	/**
     * Builds the volume module
     * @private
     */
	_buildVolume(){
		const 	title = document.createElement('h4'),
				section = document.createElement('section'),
				div = document.createElement('div');
			

		section.classList.add('mcc-volume', 'mcc-hidden');
		this._elements.wrapper.appendChild(section);

		title.innerHTML = this._translated().volumeTitle;
		section.appendChild(title);

		section.appendChild(div);
		this._elements.volume = new MovingVolumeCalculator(div, {
			lang: this._parameters.lang,
			rooms: this._parameters.options.rooms
		});
	}

	/**
     * Builds the contact module
     * @private
     */
	_buildContact(){
		if(this._parameters.askForContact){
			const 	title = document.createElement('h4'),
					section = document.createElement('section'),
					p = document.createElement('p');

			section.classList.add('mcc-contact', 'mcc-hidden');
			this._elements.wrapper.appendChild(section);

			title.innerHTML = this._translated().enterContact;
			section.appendChild(title);

			this._elements.contact = document.createElement('input');
			section.appendChild(this._elements.contact);

			// Validation
			this._elements.validation.contact = document.createElement('button');
			this._elements.validation.contact.disabled = true;
			this._elements.validation.contact.innerHTML = this._translated().next;
			p.appendChild(this._elements.validation.contact);
			section.appendChild(p);
		}
	}

	/**
     * Builds the loader module
     * @private
     */
	_buildLoader(){
		const 	section = document.createElement('section'),
				p = document.createElement('p');

		section.classList.add('mcc-loader', 'mcc-hidden');
		this._elements.wrapper.appendChild(section);

		p.innerHTML = this._translated().loading;
		section.appendChild(p);
	}

	/**
     * Builds the estimations module
     * @private
     */
	_buildEstimations(){
		let title = document.createElement('title'),
			section = document.createElement('section');

		section = document.createElement('section');
		section.classList.add('mcc-estimations', 'mcc-hidden');
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
		this._createDepartureAddressListeners();

		/*
		 * Arrival address
		 */
		this._createArrivalAddressListeners();

		/**
		 * Addresses validation
		 */
		this._elements.validation.addresses.addEventListener('click', () => {
			this._elements.wrapper.querySelector('section.mcc-volume').classList.remove('mcc-hidden');
			this._elements.wrapper.querySelector('section.mcc-addresses').classList.add('mcc-hidden');
		});

		/*
		 * Volume
		 */
		this._elements.volume.onChange(value => {
			if(this._elements.volume.isValid()){
				this.data.volume = value;
				this.data.volumeData = this._elements.volume.data;
			}
		}).onValidate(data => {
			this.data.volume = this._elements.volume.volume;
			this.data.volumeData = data;

			// Go to next step
			if(this._parameters.askForContact){
				this._elements.wrapper.querySelector('section.mcc-contact').classList.remove('mcc-hidden');
				this._elements.wrapper.querySelector('section.mcc-volume').classList.add('mcc-hidden');
			}else{
				this._elements.wrapper.querySelector('section.mcc-loader').classList.remove('mcc-hidden');
				this._elements.wrapper.querySelector('section.mcc-volume').classList.add('mcc-hidden');

				this.validate();
			}
			
		});

		/*
		 * Contact
		 */
		if(this._parameters.askForContact){
			this._elements.contact.addEventListener('input', () => {
				const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				
				if(emailValidator.test(this._elements.contact.value)){
					this.data.contact = this._elements.contact.value;
	
					// Enable next step
					this._elements.validation.contact.disabled = false;
				}else{
					// Disable next step
					this._elements.validation.contact.disabled = true;
				}
			});

			/**
			 * Contact validation
			 */
			this._elements.validation.contact.addEventListener('click', () => {
				this._elements.wrapper.querySelector('section.mcc-loader').classList.remove('mcc-hidden');
				this._elements.wrapper.querySelector('section.mcc-contact').classList.add('mcc-hidden');

				this.validate();
			});
		}
	}

	/**
	 * Creates the departure address' listeners
	 * @private
	 */
	_createDepartureAddressListeners(){
		// Address
		this._elements.departure.address.onSelect(address => {
			this.data.addresses.departure.value = address.formatted_address;

			this.data.addresses.departure.components.streetNumber = this._getAddressComponent(address, 'street_number');
			this.data.addresses.departure.components.route = this._getAddressComponent(address, 'route');
			this.data.addresses.departure.components.zipCode = this._getAddressComponent(address, 'postal_code');
			this.data.addresses.departure.components.locality = this._getAddressComponent(address, 'locality');
			this.data.addresses.departure.components.country = this._getAddressComponent(address, 'country');
			this.data.addresses.departure.components.countryCode = this._getAddressComponent(address, 'country', true);
			this.data.addresses.departure.components.department = this._getAddressComponent(address, 'administrative_area_level_2');
			this.data.addresses.departure.components.region = this._getAddressComponent(address, 'administrative_area_level_1');

			this.data.addresses.departure.location.lat = address.geometry.location.lat();
			this.data.addresses.departure.location.lng = address.geometry.location.lng();
			this.data.addresses.departure.location.placeId = address.place_id;

			// Enable next step if both addresses are filled
			if(this._elements.departure.address.value.formatted_address && this._elements.arrival.address.value.formatted_address){
				this._elements.validation.addresses.disabled = false;
			}else{
				this._elements.validation.addresses.disabled = true;
			}
		});

		// Address options toggler
		if(Object.values(this._parameters.options).some(option => option == true)){
			this._elements.departure.optionToggler.addEventListener('click', e => {
				e.preventDefault();
				
				if(this._elements.departure.optionToggler.classList.contains('mcc-address-options-enable')){
					this._elements.departure.optionToggler.classList.remove('mcc-address-options-enable');
					this._elements.departure.optionToggler.classList.add('mcc-address-options-disable');
					this._elements.departure.optionToggler.innerText = this._translated().lessAddressOptions;
	
					this._elements.wrapper.querySelector('.mcc-departure.mcc-address-options').classList.remove('mcc-hidden');
				}else{
					this._elements.departure.optionToggler.classList.remove('mcc-address-options-disable');
					this._elements.departure.optionToggler.classList.add('mcc-address-options-enable');
					this._elements.departure.optionToggler.innerText = this._translated().moreAddressOptions;
	
					this._elements.wrapper.querySelector('.mcc-departure.mcc-address-options').classList.add('mcc-hidden');
				}
			});
	
			// Address options
			if(this._parameters.options.floor){
				this._elements.departure.options.floor.addEventListener('change', () => {
					this.data.addresses.departure.options.floor = +this._elements.departure.options.floor.value;
				});
			}
	
			if(this._parameters.options.lift){
				this._elements.departure.options.lift.addEventListener('change', () => {
					this.data.addresses.departure.options.lift = this._elements.departure.options.lift.value == 'true';
				});
			}
			
			if(this._parameters.options.porterageDistance){
				this._elements.departure.options.porterageDistance.addEventListener('change', () => {
					this.data.addresses.departure.options.porterageDistance = +this._elements.departure.options.porterageDistance.value;
				});
			}
		}
	}

	/**
	 * Creates the arrival address' listeners
	 * @private
	 */
	_createArrivalAddressListeners(){
		this._elements.arrival.address.onSelect(address => {
			// Address
			this.data.addresses.arrival.value = address.formatted_address;

			this.data.addresses.arrival.components.streetNumber = this._getAddressComponent(address, 'street_number');
			this.data.addresses.arrival.components.route = this._getAddressComponent(address, 'route');
			this.data.addresses.arrival.components.zipCode = this._getAddressComponent(address, 'postal_code');
			this.data.addresses.arrival.components.locality = this._getAddressComponent(address, 'locality');
			this.data.addresses.arrival.components.country = this._getAddressComponent(address, 'country');
			this.data.addresses.arrival.components.countryCode = this._getAddressComponent(address, 'country', true);
			this.data.addresses.arrival.components.department = this._getAddressComponent(address, 'administrative_area_level_2');
			this.data.addresses.arrival.components.region = this._getAddressComponent(address, 'administrative_area_level_1');
			
			this.data.addresses.arrival.location.lat = address.geometry.location.lat();
			this.data.addresses.arrival.location.lng = address.geometry.location.lng();
			this.data.addresses.arrival.location.placeId = address.place_id;

			// Enable next step if both addresses are filled
			if(this._elements.departure.address.value.formatted_address && this._elements.arrival.address.value.formatted_address){
				this._elements.validation.addresses.disabled = false;
			}else{
				this._elements.validation.addresses.disabled = true;
			}
		});

		// Address options toggler
		if(Object.values(this._parameters.options).some(option => option == true)){
			this._elements.arrival.optionToggler.addEventListener('click', e => {
				e.preventDefault();
				
				if(this._elements.arrival.optionToggler.classList.contains('mcc-address-options-enable')){
					this._elements.arrival.optionToggler.classList.remove('mcc-address-options-enable');
					this._elements.arrival.optionToggler.classList.add('mcc-address-options-disable');
					this._elements.arrival.optionToggler.innerText = this._translated().lessAddressOptions;
	
					this._elements.wrapper.querySelector('.mcc-arrival.mcc-address-options').classList.remove('mcc-hidden');
				}else{
					this._elements.arrival.optionToggler.classList.remove('mcc-address-options-disable');
					this._elements.arrival.optionToggler.classList.add('mcc-address-options-enable');
					this._elements.arrival.optionToggler.innerText = this._translated().moreAddressOptions;
	
					this._elements.wrapper.querySelector('.mcc-arrival.mcc-address-options').classList.add('mcc-hidden');
				}
			});
	
			// Address options
			if(this._parameters.options.floor){
				this._elements.arrival.options.floor.addEventListener('change', () => {
					this.data.addresses.arrival.options.floor = +this._elements.arrival.options.floor.value;
				});
			}
	
			if(this._parameters.options.lift){
				this._elements.arrival.options.lift.addEventListener('change', () => {
					this.data.addresses.arrival.options.lift = this._elements.arrival.options.lift.value == 'true';
				});
			}
			
			if(this._parameters.options.porterageDistance){
				this._elements.arrival.options.porterageDistance.addEventListener('change', () => {
					this.data.addresses.arrival.options.porterageDistance = +this._elements.arrival.options.porterageDistance.value;
				});
			}
		}
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
     * Get a component for a given address
	 * @param {external:PlaceResult} 	address 	The address to search in
	 * @param {String}					component 	The component's name
	 * @param {Boolean} 				isShort 	Get the short name ?
     * @private
     */
    _getAddressComponent(address, component, isShort){
		const target = address.address_components.find(c => c.types.includes(component));
		
		return target ? isShort ? target.short_name : target.long_name : '';
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
	 * Validates the calculator data & calculates the estimations
	 * @returns {MovingCostCalculator} The current MovingCostCalculator
	 */
	validate(){
		if(this._parameters.remoteCalculator){
			new AjaxSender(this._parameters.remoteCalculator, {
				data: this.data,
				method: 'POST',
				load: response => {
					console.log(response);

					this._elements.wrapper.querySelector('section.mcc-estimations').innerHTML = `
						<div style="font-family: 'Courier New', Courier, monospace">${response[0].logs.map(log => `${log}<br />`).join('')}</div>
					`;

					this._elements.wrapper.querySelector('section.mcc-estimations').innerHTML += `
						<ul>
							${response.map(offer => `
								<li>
									<p>${offer.name}</p>
									<p>(Admin) Prix: ${offer.price} €</p>
									<p>De: ${offer.price - offer.range} €</p>
									<p>A: ${offer.price + offer.range} €</p>
									<p>Services:</p>
									${offer.services.map(service => `
										<p>${service}</p>
									`).join('')}
								</li>
							`).join('')}
						</ul>
					`;

					// Do stuff with the estimations here
					this._elements.wrapper.querySelector('section.mcc-loader').classList.add('mcc-hidden');
					this._elements.wrapper.querySelector('section.mcc-estimations').classList.remove('mcc-hidden');
				},
				error: error => {
					console.log(error);
				}
			});
		}else{
			// Calculate data locally here
			this._elements.wrapper.querySelector('section.mcc-loader').classList.add('mcc-hidden');
			this._elements.wrapper.querySelector('section.mcc-estimations').classList.remove('mcc-hidden');
		}

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