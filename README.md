# Moving Cost Calculator [(Demo)](https://jsfiddle.net/Zenoo0/o7bd8qag/)

![Dependencies](https://david-dm.org/Zenoo/moving-cost-calculator.svg)

Calculate the cost for your move

### Doc

* **Installation**

Simply import MovingCostCalculator and [MovingVolumeCalculator](https://github.com/Zenoo/moving-volume-calculator) into your HTML.
```
<link rel="stylesheet" type="text/css" href="https://gitcdn.link/repo/Zenoo/moving-volume-calculator/master/MovingVolumeCalculator.min.css">
<link rel="stylesheet" type="text/css" href="https://gitcdn.link/repo/Zenoo/moving-cost-calculator/master/MovingCostCalculator.min.css">
<script src="https://gitcdn.link/repo/Zenoo/moving-volume-calculator/master/MovingVolumeCalculator.min.js"></script>	
<script src="https://gitcdn.link/repo/Zenoo/moving-cost-calculator/master/MovingCostCalculator.min.js"></script>	
```
* **How to use**

Create a new [`MovingCostCalculator`](https://zenoo.github.io/moving-cost-calculator/MovingCostCalculator.html) object with a query String or an Element as the first parameter :
```
let movingCostCalculator = new MovingCostCalculator('div.with[any="selector"]', options);
// OR
let element = document.querySelector('li.terally[any="thing"]');
let movingCostCalculator = new MovingCostCalculator(element, options);
```
* **Options**

```
{

}
```
* **Methods**

See the [documentation](https://zenoo.github.io/moving-cost-calculator/MovingCostCalculator.html) for the method definitions.  

* **Example**

See this [JSFiddle](https://jsfiddle.net/Zenoo0/o7bd8qag/) for a working example

## Authors

* **Zenoo** - *Initial work* - [Zenoo.fr](https://zenoo.fr)