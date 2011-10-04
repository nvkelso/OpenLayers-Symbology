/**
* @requires ol.thematic.js
*/

ol.thematic.Choropleth = OpenLayers.Class( ol.thematic.LayerBase, 
{
	
	colors : null,
	method : null,
	numClasses : 5,
	
	defaultSymbolizer : { 'fillOpacity' : 1 },
	
	initialize : function( map, options )
	{
		ol.thematic.LayerBase.prototype.initialize.apply( this, arguments );
	},
	
	updateOptions : function( newOptions )
	{
		var oldOptions = OpenLayers.Util.extend( {}, this.options );
		this.addOptions( newOptions );
		if ( newOptions )
		{
			// new classification?
			if (newOptions.method != oldOptions.method ||
	                newOptions.indicator != oldOptions.indicator ||
	                newOptions.numClasses != oldOptions.numClasses) 
	     	{
	                this.setClassification();
	                
	        // new colors?
	      	} else if (newOptions.colors && (
	                       !newOptions.colors[0].equals(oldOptions.colors[0]) ||
	                       !newOptions.colors[1].equals(oldOptions.colors[1]))) 
	    	{
	                this.createColorInterpolation();
	    	}
		}
	},
	
	setClassification : function() 
	{
		var values = [];
		var features = this.layer.features;
		for (var i = 0; i < features.length; i++) 
		{
			values.push(features[i].attributes[this.indicator]);
		}
		var dist = new mapfish.GeoStat.Distribution(values);
		this.classification = dist.classify(
			this.method,
			this.numClasses,
			null
		);
		this.createColorInterpolation();
	},
	
	applyClassification : function( options )
	{
		this.updateOptions(options);
		var boundsArray = this.classification.getBoundsArray();
		var rules = new Array(boundsArray.length - 1);
		for (var i = 0; i < boundsArray.length -1; i++) 
		{
			var rule = new OpenLayers.Rule(
			{
				symbolizer: {fillColor: this.colorInterpolation[i].toHexString()},
				filter: new OpenLayers.Filter.Comparison(
				{
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: this.indicator,
					lowerBoundary: boundsArray[i],
					upperBoundary: boundsArray[i + 1]
				})
			});
			rules[i] = rule;
		}
		this.extendStyle(rules);
		mapfish.GeoStat.prototype.applyClassification.apply(this, arguments);
	},
	
	CLASS_NAME: "ol.thematic.Choropleth"
});