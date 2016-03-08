var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  /**
   * @class
   * @augments THREE.Texture
   */
  AMTHREE.VideoTexture = function(params) {
    THREE.Texture.call(this);

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.videoElement = document.createElement('video');

    this.setVideo(params);
  };

  AMTHREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.VideoTexture.prototype.constructor = AMTHREE.VideoTexture;

  /**
   * Copies source in this.
   * @param {AMTHREE.VideoTexture} source
   */
  AMTHREE.VideoTexture.prototype.copy = function(source) {
    THREE.Texture.prototype.copy.call(this, source);

    var params = {};

    if (source.videoElement) {
      params.width = source.videoElement.width;
      params.height = source.videoElement.height;
      params.loop = source.videoElement.loop;
      params.autoplay = source.videoElement.autoplay;
    }

    params.src = source.src;

    this.setVideo(params);

    return this;
  };

  /**
  * Clones this.
  * @returns {AMTHREE.VideoTexture}
  */
  AMTHREE.VideoTexture.prototype.clone = function () {
    return new this.constructor().copy( this );
  };

  /**
   * Plays the animated texture.
   */
  AMTHREE.VideoTexture.prototype.play = function() {
    if (this.videoElement && !this.playing) {
      if (!this.paused) {
        this.videoElement.src = this.src;
      }
      this.videoElement.setAttribute('crossorigin', 'anonymous');
      this.videoElement.play();
      this.image = this.videoElement;
      this.playing = true;
    }
  };

  /**
   * Updates the animated texture.
   */
  AMTHREE.VideoTexture.prototype.update = function() {
    if (this.videoElement
      && this.videoElement.readyState == this.videoElement.HAVE_ENOUGH_DATA) {
      this.needsUpdate = true;
    }
  };

  /**
   * Pauses the animated texture.
   */
  AMTHREE.VideoTexture.prototype.pause = function() {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
      this.playing = false;
    }
  };

  /**
   * Stops the animated texture.
   */
  AMTHREE.VideoTexture.prototype.stop = function() {
    if (this.videoElement) {
      this.pause();
      this.videoElement.src = '';
      this.image = undefined;
      this.needsUpdate = true;
    }
  };

  /**
   * Sets the source video of the texture.
   */
  AMTHREE.VideoTexture.prototype.setVideo = function(params) {

    this.stop();

    if (params) {
      this.src = params.src;

      this.videoElement.width = params.width;
      this.videoElement.height = params.height;
      this.videoElement.autoplay = (typeof params.autoplay !== 'undefined') ? params.autoplay : false;
      this.videoElement.loop = (typeof params.loop !== 'undefined') ? params.loop : true;
    }

    this.playing = false;

    if (this.videoElement.autoplay)
      this.play();
  };


}
else {
  AMTHREE.VideoTexture = function() {
    console.warn('VideoTexture.js: THREE undefined');
  };
}