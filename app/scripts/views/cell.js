define(['vendor/backbone', 'vendor/lodash', 'engine'], function (Backbone, _, Engine) {
    'use strict';

    var Cell = Backbone.View.extend({

        className: 'cell',

        events: {
            'click'             : 'movehere',
            'mouseenter'        : 'showGuide',
            'mouseleave'        : 'hideGuide'
        },

        initialize: function (options) {
            this.options = options || {};
            this._index = this.options._index;
            this._square = this.options._square;
            this._board = this.options._board;
            this._squareIndex = this._square._index;
            this.guided = false;
            this.listenTo(this.model, 'change:value', this.render);
        },

        render: function () {
            if (this.model.get('value')) {
                this.$el.addClass('o p' + this.model.get('value'));
            } else {
                this.$el.removeClass('o p1 p2');
            }
            return this;
        },

        movehere: function (event) {
            if (this._square.$el.hasClass('moveable')) {
                Engine.getInstance().trigger('cell:move', this.model, this._squareIndex, this._index);
            } else {
                console.log('Invalid move');
            }
        },

        showGuide: function () {
            var self = this;
            if (this._square.$el.hasClass('moveable')) {
                this.timer = _.delay(function () {
                    self.guided = true;
                    Engine.getInstance().trigger('show:guide', self._index);
                }, 800);
            }
        },

        hideGuide: function () {
            clearTimeout(this.timer);
            if (this.guided) {
                this.guided = false;
                Engine.getInstance().trigger('hide:guide', this._index);
            }
        }

    });


    return Cell;
});
