ig.module('game.main').requires('impact.game', 'impact.font', 'game.levels.level', 'game.entities.player').defines(function() {

    DoubleDragon = ig.Game.extend({

        // Load a font
        font: new ig.Font('media/04b03.font.png'),
        upperBoundY: 240,
        lowerBoundY: 10,

        autoSort: true,
        sortBy: ig.Game.SORT.POS_Y,

        init: function() {

            // Bind keys
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.D, 'jump');
            ig.input.bind(ig.KEY.A, 'punch');
            ig.input.bind(ig.KEY.S, 'kick');

            this.loadLevel(LevelLevel);

            var player = this.getEntitiesByType(EntityPlayer)[0];
            //this.gamesocket = new ig.ImpactConnect(player, 1337);
        },

        update: function() {

            this.parent();
        },

        draw: function() {

            this.parent();
            //this.font.draw('| | | | | |', x, y, ig.Font.ALIGN.LEFT);
        },

        getEntityById: function(id) {
            for (var i in this.entities) {
                if (this.entities[i].id === id) {
                    return this.entities[i];
                }
            }
            return null;
        },
        getEntityByRemoteId: function(id) {
            var tEntities = this.getEntitiesByType(EntityPlayer);
            for (var i in tEntities) {
                if (tEntities[i].remoteId === id) {
                    return tEntities[i];
                }
            }
            return null;
        }
    });


    MainLoader = ig.Loader.extend({

        draw: function() {

            var w = ig.system.realWidth;
            var h = ig.system.realHeight;
            ig.system.context.fillStyle = '#000000';
            ig.system.context.fillRect(0, 0, w, h);

            var percentage = (this.status * 100).round() + '%';
            ig.system.context.fillStyle = '#ffffff';
            ig.system.context.fillText(percentage, w / 2, h / 2);
        }
    });

    ig.main('#canvas', DoubleDragon, 60, 320, 190, 3, MainLoader);

});