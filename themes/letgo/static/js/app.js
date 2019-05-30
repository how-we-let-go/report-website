(function() {

    let calculateHeight = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    calculateHeight();


    window.CanvasSlideshow = function( options ) {

        //  SCOPE
        /// ---------------------------      
        var that  =   this;

        //  OPTIONS
        /// ---------------------------      
        options                     = options || {};
        options.stageWidth          = options.hasOwnProperty('stageWidth') ? options.stageWidth : 1920;
        options.stageHeight         = options.hasOwnProperty('stageHeight') ? options.stageHeight : 1080;
        options.pixiSprites         = options.hasOwnProperty('sprites') ? options.sprites : [];
        options.centerSprites       = options.hasOwnProperty('centerSprites') ? options.centerSprites : false;
        options.autoPlay            = options.hasOwnProperty('autoPlay') ? options.autoPlay : true;
        options.autoPlaySpeed       = options.hasOwnProperty('autoPlaySpeed') ? options.autoPlaySpeed : [10, 3];
        options.fullScreen          = options.hasOwnProperty('fullScreen') ? options.fullScreen : true;
        options.displacementImage   = options.hasOwnProperty('displacementImage') ?     options.displacementImage : '';
        options.displaceAutoFit     = options.hasOwnProperty('displaceAutoFit')  ?  options.displaceAutoFit : false; 

        //  PIXI VARIABLES
        /// ---------------------------    
        var renderer            = new PIXI.autoDetectRenderer( options.stageWidth, options.stageHeight, { transparent: true });
        var stage               = new PIXI.Container();
        var slidesContainer     = new PIXI.Container();
        var particlesContainer  = new PIXI.ParticleContainer();
        var displacementSprite  = new PIXI.Sprite.fromImage( options.displacementImage );
        var displacementFilter  = new PIXI.filters.DisplacementFilter( displacementSprite, 30);

        particlesContainer.setProperties({
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true
        });

        /// ---------------------------
        //  INITIALISE PIXI
        /// ---------------------------      
        this.initPixi = function() {

            // Add canvas to the HTML
            //document.body.appendChild( renderer.view );
            document.getElementById('js-canvas-wrapper').appendChild(renderer.view);

            // Add child container to the main container 
            stage.addChild( slidesContainer );
            stage.addChild( particlesContainer );

            // Enable Interactions
            stage.interactive = true; 

            // Fit renderer to the screen
            if ( options.fullScreen === true ) {
                renderer.view.style.objectFit = 'cover';
                renderer.view.style.objectPosition = '100% 0%';
                renderer.view.style.width     = '100%';
                renderer.view.style.height    = '100%';
                renderer.view.style.top       = '50%';
                renderer.view.style.left      = '50%';
                renderer.view.style.webkitTransform = 'translate( -50%, -50% ) scale(1.1)';
                renderer.view.style.transform = 'translate( -50%, -50% ) scale(1.1)';           
            } 

            displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            // Set the filter to stage and set some default values for the animation
            stage.filters = [displacementFilter];        

            displacementSprite.anchor.set(0.5);
            displacementSprite.x = renderer.width / 2;
            displacementSprite.y = renderer.height / 2; 

            displacementSprite.scale.x = 1;
            displacementSprite.scale.y = 1;

            stage.addChild( displacementSprite );
        };

        /// ---------------------------
        //  LOAD SLIDES TO CANVAS
        /// ---------------------------          
        this.loadPixiSprites = function( sprites ) {

            var rSprites = options.sprites;

            for ( var i = 0; i < rSprites.length; i++ ) {

                var texture   = new PIXI.Texture.fromImage( sprites[i] );
                var image     = new PIXI.Sprite( texture );

                if ( options.centerSprites === true ) {
                    image.anchor.set(0.5);
                    image.x = renderer.width / 2;
                    image.y = renderer.height / 2;            
                }

                slidesContainer.addChild( image );

            } 

        };

        /// ---------------------------
        //  Particle emitter
        /// ---------------------------          
        var emitter = new PIXI.particles.Emitter(

            // The PIXI.Container to put the emitter in
            // if using blend modes, it's important to put this
            // on top of a bitmap, and not use the root stage Container
            particlesContainer,

            // The collection of particle images to use
            [PIXI.Texture.fromImage('https://pixijs.io/pixi-particles-editor/assets/images/particle.png')],

            // Emitter configuration, edit this to change the look
            // of the emitter
            {
                "alpha": {
                    "start": 0.59,
                    "end": 0
                },
                "scale": {
                    "start": 0.01,
                    "end": 0.35,
                    "minimumScaleMultiplier": 1
                },
                "color": {
                    "start": "#ffffff",
                    "end": "#556782"
                },
                "speed": {
                    "start": 3,
                    "end": 20,
                    "minimumSpeedMultiplier": 1
                },
                "acceleration": {
                    "x": 0,
                    "y": 0
                },
                "maxSpeed": 0,
                "startRotation": {
                    "min": 0,
                    "max": 360
                },
                "noRotation": true,
                "rotationSpeed": {
                    "min": 0,
                    "max": 0
                },
                "lifetime": {
                    "min": 0.2,
                    "max": 30
                },
                "blendMode": "normal",
                "frequency": 0.0001, // TOO LOW!
                "emitterLifetime": -1,
                "maxParticles": 50, // TOO MANY?
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "rect",
                "spawnRect": {
                    "x": 0,
                    "y": options.stageHeight/3,
                    "w": options.stageWidth,
                    "h": 2*(options.stageHeight/3),
                }
            }
        );

        emitter.emit = true;
        emitter.updateSpawnPos(0,0);

        // Calculate the current time
        var elapsed = Date.now();

        /// ---------------------------
        //  DEFAULT RENDER/ANIMATION
        /// ---------------------------        
        var ticker = new PIXI.ticker.Ticker();

        ticker.autoStart = options.autoPlay;

        ticker.add(function( delta ) {

            displacementSprite.x += options.autoPlaySpeed[0] * delta;
            displacementSprite.y += options.autoPlaySpeed[1];

            var now = Date.now();
            emitter.update((now - elapsed) * 0.001);
            elapsed = now;

            renderer.render( stage );

        });

        /// ---------------------------
        //  INIT FUNCTIONS
        /// ---------------------------    

        this.init = function() {
            that.initPixi();
            that.loadPixiSprites( options.pixiSprites );
        };

        /// ---------------------------
        //  START 
        /// ---------------------------           
        this.init();

    };

})(); 

var spriteImagesSrc = [];
spriteImagesSrc.push('/img/title-background.jpg');

var initCanvasSlideshow = new CanvasSlideshow({
    sprites: spriteImagesSrc,
    displacementImage: '/img/displacement.jpg',
    autoPlay: true,
    autoPlaySpeed: [0, 2],
    interactive: false,
    displaceAutoFit: true,
});
