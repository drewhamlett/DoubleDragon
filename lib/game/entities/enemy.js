ig.module('game.entities.enemy').requires('impact.entity').defines(function() {

    EntityEnemy = ig.Entity.extend({

        size: {
            x: 20,
            y: 10
        },
        offset: {
            x: 4,
            y: 45
        },

        flip: true,
        accelGround: 200,
        isPunching: false,
        attacking: false,
        wasPunching: false,
        speed: 30,
        jumpPos: 0,
        isJumping: false,
        isFalling: false,
        takingDamage: false,
        zIndex: 0,
        isIdle: true,

        health: 100,

        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.PASSIVE,

        animSheet: new ig.AnimationSheet('media/enemy1.png', 36, 58),

        init: function(x, y, settings) {

            this.addAnim('idle', 0.1, [0]);
            this.addAnim('walk', 0.3, [1, 0]);
            this.addAnim('idlePunch', 0.1, [2]);
            this.addAnim('punch', 0.16, [3, 2], true);
            this.addAnim('punch2', 0.16, [4, 2], true);
            this.addAnim('kick', 0.16, [5, 6, 2], true);

            this.addAnim('hitLight', 0.1, [5]);

            this.parent(x, y, settings);
        },

        update: function() {

            this.parent();
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];

            if (this.takingDamage) {
                this.isIdle = false;
                this.currentAnim = this.anims.hitLight;
            } else {
                this.isIdle = true;
                this.currentAnim = this.anims.idle;
            }

            if (player.pos.x > this.pos.x) {
                this.flip = false;
            } else {
                this.flip = true;
            }

            var angle = this.angleTo(player);

            var x = Math.cos(angle);
            var y = Math.sin(angle);

            //this.vel.x = x * 20;
            //  this.vel.y = y * 20;
            //  if(this.vel.x > 0 || this.vel.x < 0) {
            //  this.currentAnim = this.anims.walk;
            //  }
            //this.flip ? this.offset.x = 13 : this.offset.x = 4;
            this.currentAnim.flip.x = this.flip;

        },

        receiveDamage: function(amount, other) {
            this.takingDamage = true;
        }
    });
});