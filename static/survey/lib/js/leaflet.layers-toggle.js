/*
 * L.Control.LayersToggle is a control to allow users to toggle between two 
 * layers on the map. Adapted from L.Control.Layers.
 */
L.Control.LayersToggle = L.Control.extend({
    options: {
        position: 'topright'
    },

    initialize: function (label1, layer1, label2, layer2, options) {
        L.setOptions(this, options);

        this._handlingClick = false;
        
        this._layer1 = {key: L.stamp(layer1), label: label1, layer: layer1};
        this._layer2 = {key: L.stamp(layer2), label: label2, layer: layer2};

        this._selectedLayerKey = this._layer1.key;
    },

    onAdd: function (map) {
        this._initLayout();
        this._update();

        map
            .on('layeradd', this._onLayerChange, this)
            .on('layerremove', this._onLayerChange, this);

        return this._container;
    },

    onRemove: function (map) {
        map
            .off('layeradd', this._onLayerChange)
            .off('layerremove', this._onLayerChange);
    },

    _initLayout: function () {
        var className = 'geosurvey-map-control-layers-toggle',
            container = this._container = L.DomUtil.create('div', className);

        var link = this._layersLink = L.DomUtil.create('button', className + '-toggle btn btn-large', container);
        link.title = 'Switch Map Imagery';
        link.innerHTML = '';

        L.DomEvent.on(link, 'click', this._onClick, this);

        container.appendChild(link);
    },

    _update: function () {
        if (!this._container) {
            return;
        }

        this._layersLink.innerHTML = this._selectedLayerKey === this._layer1.key ? this._layer2.label : this._layer1.label;
    },

    _onLayerChange: function (e) {
        var id = L.stamp(e.layer);
        
        if ((this._layer1.key === id || this._layer2.key === id) && !this._handlingClick) {
            this._update();
        }
    },

    _onClick: function () {
        var layerAdd,
            layerRemove,
            show1 = this._selectedLayerKey === this._layer2.key;

        this._handlingClick = true;
        layerAdd = show1 ? this._layer1.layer : this._layer2.layer;
        layerRemove = show1 ? this._layer2.layer : this._layer1.layer;
        this._selectedLayerKey = show1 ? this._layer1.key : this._layer2.key;
        
        if (! this._map.hasLayer(layerAdd)) {
            this._map.addLayer(layerAdd, true);
            this._map.setZoom(this._map.getZoom());
            this._map.fire('baselayerchange', {layer: layerAdd});
            this._map.removeLayer(layerRemove);
        }

        this._update();

        this._handlingClick = false;
    }
});

L.control.layersToggle = function (label1, layer1, label2, layer2, options) {
    return new L.Control.LayersToggle(label1, layer1, label2, layer2, options);
};