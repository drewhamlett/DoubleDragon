ig.module('game.entities.player').requires('impact.entity').defines(function() {

    function move(player, params) {

        options = {};
        options.currentAnim = params.currentAnim || player.anims.walk;
        options.flip = params.flip || false;
        options.speed = params.speed || player.speed;

        player.vel.x = options.speed;
        player.currentAnim = options.currentAnim;
        player.flip = options.flip;
        player.currentAnim.stop = false;
    }

    function setHealth(player, value) {
        player.health = value;
    }

    EntityPlayer = ig.Entity.extend({

        size: {
            x: 26,
            y: 10
        },

        offset: {
            x: 4,
            y: 50
        },

        zIndexPadding: 10,

        flip: false,
        accelGround: 200,
        isPunching: false,
        isKicking: false,
        attacking: false,
        //used to change idle animation if player was punching
        wasPunching: false,
        //speed of walking
        speed: 70,
        //used to hold last position for jumping
        jumpPos: 0,

        isJumping: false,
        isFalling: false,
        canHit: false,
        punchCount: 0,


        health: 100,

        zIndex: 1,
        handlesInput: true,


        type: ig.Entity.TYPE.A,
        // Player friendly group
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.PASSIVE,

        timer: new ig.Timer(),

        animSheet: new ig.AnimationSheet('media/player1.png', 36, 58),

        broadcastPosition: function() {

            ig.game.gamesocket.send('move', {
                pos: this.pos,
                remoteAnim: this.remoteAnim,
                remoteId: this.remoteId,
                flipped: this.flip
            });
        },

        init: function(x, y, settings) {

            this.parent(x, y, settings);
            ig.merge(this, settings);
            this.addAnim('idle', 0.1, [0]);
            this.addAnim('walk', 0.3, [1, 0]);
            this.addAnim('idlePunch', 0.1, [2]);
            this.addAnim('punch', 0.16, [3, 2], true);
            this.addAnim('punch2', 0.16, [4, 2], true);
            this.addAnim('kick', 0.11, [5, 6, 2], true);

            this.remoteAnim = "idle";
        },

        updatePlayer: function() {

            if (this.isJumping === false) {
                this.jumpPos = this.pos.y;
            }

            if (ig.input.pressed('punch') && !this.attacking && !this.isPunching) {

                this.punchCount += 1;
                this.vel.x = this.vel.y = 0;
                this.remoteAnim = "punch";

                if (this.punchCount % 2 === 0) {
                    this.currentAnim = this.anims.punch2;
                } else {
                    this.currentAnim = this.anims.punch;
                }
                this.currentAnim.rewind();
                this.currentAnim.frame = 0;
                this.isPunching = true;
                this.attacking = true;
                this.wasPunching = true;


            } else if (ig.input.released('punch')) {

                this.isPunching = false;

            } else if (ig.input.pressed('kick') && !this.attacking) {

                this.vel.x = this.vel.y = 0;
                this.currentAnim = this.anims.kick;
                this.remoteAnim = "kick";

                this.currentAnim.rewind();
                this.currentAnim.frame = 0;

                this.attacking = true;
                this.isKicking = true;

            } else if (ig.input.released('kick')) {
                this.isKicking = false;
            } else {

                if (ig.input.state('left') && !this.attacking && this.pos.x > ig.game.screen.x && !ig.input.state('right')) {

                    move(this, {
                        currentAnim: this.anims.walk,
                        flip: true,
                        speed: -this.speed
                    });
                    this.wasPuching = false;

                } else if (ig.input.state('right') && !this.attacking && this.pos.x < (ig.game.screen.x + ig.system.width - this.size.x) && !ig.input.state('left')) {

                    move(this, {
                        currentAnim: this.anims.walk,
                        flip: false,
                        speed: this.speed
                    });

                    this.wasPunching = false;

                } else {
                    this.vel.x = 0;
                }

                if (ig.input.state('up') && !this.attacking) {

                    this.currentAnim = this.anims.walk;
                    this.remoteAnim = "walk";
                    this.currentAnim.stop = false;
                    if (this.pos.y > ig.game.lowerBoundY) {
                        this.vel.y = -this.speed;
                    } else {
                        this.vel.y = 0;
                    }

                } else if (ig.input.state('down') && !this.attacking) {

                    this.currentAnim = this.anims.walk;
                    this.remoteAnim = "walk";
                    this.currentAnim.stop = false;
                    if (this.pos.y < ig.game.upperBoundY) {
                        this.vel.y = this.speed;
                    } else {
                        this.vel.y = 0;
                    }

                } else if (ig.input.state('jump') && !this.attacking) {
                    this.isJumping = true;
                } else {
                    this.vel.y = 0;
                }

                if (this.vel.x === 0 && this.vel.y === 0 && this.attacking === false) {
                    if (this.wasPunching) {
                        this.currentAnim = this.anims.idlePunch;
                        this.remoteAnim = "idlePunch";
                    } else {
                        this.currentAnim = this.anims.idle;
                        this.remoteAnim = "idle";
                    }
                }
            }

            if (this.isJumping) {
                if (this.pos.y < this.jumpPos - 25) {
                    this.isFalling = true;

                } else {
                    this.vel.y = -540;
                    this.pos.y -= 2;
                }
                console.log(this.jumpPos);
            }

            if (this.isFalling) {

                this.vel.y = 540;
                this.pos.y += 2;

                if (this.pos.y >= this.jumpPos) {
                    this.pos.y = this.jumpPos;
                    this.vel.y = 0;
                    this.isFalling = false;
                    this.isJumping = false;
                }
            }

            this.offset.x = this.flip ? 13 : 4;
            


            this.currentAnim.flip.x = this.flip;


            if (this.currentAnim.frame === this.currentAnim.sequence.length - 1 && this.attacking === true) {
                this.attacking = false;
                this.canHit = false;
            }

            //this.zIndex = Math.floor(this.pos.y + this.size.y) + this.zIndexPadding
        },

        update: function() {

            this.parent();
            if (this.handlesInput) {
                this.updatePlayer();
            }
        },

        check: function(other) {

            if (other instanceof EntityEnemy) {

                if (other.pos.y < this.pos.y) {

                    if ((other.flip && !this.flip) || (!other.flip && this.flip)) {
                        if (this.attacking) {
                            other.receiveDamage(10, this);
                        } else {
                            other.takingDamage = false;
                        }
                    }

                }
            }
        }
    });
});