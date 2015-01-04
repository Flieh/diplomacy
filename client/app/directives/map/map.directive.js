angular.module('map.directives', ['d3'])
.directive('sgMap', ['d3Service', function(d3Service) {
    'use strict';

    var regionClicked = function() {
        console.log(this.id);

        // TODO: Order input logic
    };

    var getCentroid = function(selection) {
        var   bbox = selection.getBBox();
        // return the center of the bounding box
        return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    };

    return {
        replace: true,
        scope: {
            variant: '=variant',        // full variant data (JSON)
            moves: '=moves',            // movement data, full or partial (JSON)
            readonly: '=readonly',      // whether to allow user interaction (bool)
            arrows: '=arrows'           // whether to show movement arrows -- true implies 'moves' is defined (bool)
        },
        restrict: 'E',
        link: function(scope, element, attrs) {
            element = element[0];

            scope.$watch('variant', function(variant) {
                if (variant.name) {
                    d3Service.xml('variants/' + scope.variant.name + '/' + scope.variant.name + '.svg', 'image/svg+xml', function(xml) {
                        // STEP 1: build base SVG

                        var svg = d3Service.select(element)
                            .append('svg')
                            .attr("width", '100%')              // TODO: change?
                            .attr("viewBox", '0 0 1152 965');   // TODO: do not hardcode viewBox dimensions

                        svg.append('g')
                            .append('svg:image')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('xlink:href', 'variants/' + scope.variant.name + '/' + 'std_bit.png')  // TODO: find better filename for map BG
                            .attr('width', 1152)                // TODO: do not hardcode width
                            .attr('height', 965);               // TODO: do not hardcode height

                        var mouseLayer = svg.append(function() { return xml.documentElement.getElementById('MouseLayer'); })
                            .selectAll('path')
                            .attr('fill', 'transparent');

                        // STEP 2: if not readonly, apply UI events

                        if (!scope.readonly && xml)
                            mouseLayer.on('click', regionClicked);

                        var regions = svg.select('#MouseLayer').selectAll('path');

                        // STEP 3: apply SC dots

                        // strip regions without SC info
                        var scs = _.filter(scope.variant.regions, function(r) { return r.sc; });

                        // append SC group and one SC dot per collection item
                        var scGroup = svg.append('g')
                            .attr('class', 'scGroup')
                            .selectAll('path')
                            .data(scs)
                            .enter();

                        // inner circle
                        scGroup.append('circle')
                            .attr('cx', function(d) { return d.sc.x; })
                            .attr('cy', function(d) { return d.sc.y; })
                            .attr('fill', 'black') // TODO: colour by controlling power
                            .attr('r', 4)
                            .attr('id', function(d) { return 'sc_inner_' + d.r.toLowerCase(); });

                        // outer ring
                        scGroup.append('circle')
                            .attr('cx', function(d) { return d.sc.x; })
                            .attr('cy', function(d) { return d.sc.y; })
                            .attr('stroke', 'black') // TODO: colour by controlling power
                            .attr('stroke-width', 1)
                            .attr('fill', 'transparent')
                            .attr('r', 6)
                            .attr('id', function(d) { return 'sc_outer_' + d.r.toLowerCase(); });

                        // centroids should be kept around in case hard coords are not available
                        var centroids = { };
                        for (var r = 0; r < regions[0].length; r++)
                            centroids[regions[0][r].id] = getCentroid(regions[0][r]);

                        // if moves supplied, render them
                        if (scope.moves) {
                            // morph to d3-consumable array
                            var d3Moves = [];
                            for (var p = 0; p < scope.moves.length; p++) {
                                var temp = scope.moves[p];
                                d3Moves = temp.moves.reduce(function(coll, item) { coll.push(item); return coll; }, d3Moves);
                            }

                            svg.selectAll('circle')
                                .data(d3Moves)
                                .enter()
                                .append('circle')
                                .attr('cx', function(d) {
                                    return centroids[d.u.toLowerCase()][0]; })
                                .attr('cy', function(d) {
                                    return centroids[d.u.toLowerCase()][1]; })
                                .attr('fill', 'red')
                                .attr('r', 20)
                                .attr('id', function(d) { return 'unit_' + d.u.toLowerCase(); });
                        }
                    });
                }
            });
        }
    };
}]);
