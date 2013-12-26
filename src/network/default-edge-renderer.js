/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function DefaultEdgeRenderer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    //defaults
    this.shape = 'directed';
    this.size = 2;
    this.color = '#cccccc';
    this.strokeSize = 2;
    this.strokeColor = '#888888';
    this.opacity = 1;
    this.labelSize = 12;
    this.labelColor = '#111111';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;

    this.el;
    this.targetEl;
    this.edge;
    this.selected = false;

    this.sourceCoords;
    this.targetCoords;
    this.sourceRenderer;
    this.targetRenderer;

    //set instantiation args, must be last
    _.extend(this, args);

}

DefaultEdgeRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value) {
        this[attr] = value;
        this.update();
    },
    render: function (args) {
        this.edge = args.edge;
        this.targetEl = args.target;
        this.sourceCoords = args.sourceCoords;
        this.targetCoords = args.targetCoords;
        this.sourceRenderer = args.sourceRenderer;
        this.targetRenderer = args.targetRenderer;
        this._render();
    },
    remove: function () {
        $(this.el).remove();
    },
    update:function(){
        this.remove();
        this._render();
    },
    select: function () {
        if (!this.selected) {
            this._renderSelect();
        }
    },
    deselect: function () {
        if (this.selected) {
            this._removeSelect();
        }
    },
    moveSource: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('x1', coords.x);
        linkLine.setAttribute('y1', coords.y);
    },
    moveTarget: function (coords) {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
        linkLine.setAttribute('x2', coords.x);
        linkLine.setAttribute('y2', coords.y);
    },
    /* Private */
    _render: function () {
        var groupSvg = SVG.create('g', {
            "cursor": "pointer",
            "id": this.edge.id,
            opacity: this.opacity,
            'network-type': 'edge-g'
        });

        var offset = this.targetRenderer.getSize() / 2;
        // if not exists this marker, add new one to defs
        var markerArrowId = "#arrow-" + this.shape + "-" + offset + '-' + this.color;
        if ($(markerArrowId).length == 0) {
            this._addArrowShape(this.shape, offset, this.color, this.size, this.targetEl);
        }

        var linkSvg = SVG.addChild(groupSvg, "line", {
            "x1": this.sourceCoords.x,
            "y1": this.sourceCoords.y,
            "x2": this.targetCoords.x,
            "y2": this.targetCoords.y,
            "stroke": this.color,
            "stroke-width": this.size,
            "cursor": "pointer",
            "marker-end": "url(" + markerArrowId + ")",
            'network-type': 'edge'
        }, 0);

        this.el = groupSvg;
        SVG._insert(this.targetEl, groupSvg, 0);

        if (this.selected) {
            this._renderSelect();
        }
    },
    _renderSelect: function () {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
//        linkLine.setAttribute('stroke','#f82408');
        linkLine.setAttribute('stroke-dasharray','5, 2');

//        var linkSvg = SVG.addChild(this.el, "line", {
//            "x1": this.sourceCoords.x,
//            "y1": this.sourceCoords.y,
//            "x2": this.targetCoords.x,
//            "y2": this.targetCoords.y,
//            "stroke": '#ff0000',
//            "opacity": '0.5',
//            "stroke-width": this.size+4,
//            "cursor": "pointer",
//            'network-type': 'select-edge'
//        }, 0);

        this.selected = true;
    },
    _removeSelect: function () {
        var linkLine = $(this.el).find('line[network-type="edge"]')[0];
//        linkLine.setAttribute('stroke',this.color);
        linkLine.removeAttribute('stroke-dasharray');

//        $(this.el).find('[network-type="select-edge"]').remove();

        this.selected = false;
    },
    /**/
    _addArrowShape: function (type, offset, color, edgeSize, targetSvg) {
        var scale = 1 / edgeSize;

        if (typeof color === 'undefined') {
            color = '#000000';
        }
        var id = "arrow-" + type + '-' + offset + '-' + color;
        var marker = SVG.addChild(targetSvg, "marker", {
            "id": id,
            "orient": "auto",
            "style": "overflow:visible;"
        });

        switch (type) {
            case "directed":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
//                    "stroke": color,
//                    "stroke-width": edgeSize,
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "odirected":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
//			"points":"-14,0 -28,-6 -28,6 -14,0"
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "inhibited":
                var arrow = SVG.addChild(marker, "rect", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "x": -offset - 6,
                    "y": -6,
                    "width": 6,
                    "height": 12
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
        }
    }

}