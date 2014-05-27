/*
 * A single image, part of a multi-image graphical asset.
 *
 * methods:
 *  - ::ctor({path, width, height, index})
 *  - draw(x, y)
 *  - drawCentre(x, y)
 *  - drawBottom(x, y, margin)
 */
var _ImageSingle = function(){
  ImageSingle.displayName = 'ImageSingle';
  var prototype = ImageSingle.prototype, constructor = ImageSingle;

  function ImageSingle(options){
    var path     = options.path
    this._width  = options.width
    this._height = options.height
    this._index  = options.index

    this._image = new ig.Image(path);
  }

  /* draw */
  prototype.draw = function(x, y){
    this._image.drawTile(x, y, this._index, this._width, this._height);
  };

  /* draw the image centred */
  prototype.drawCentre = function(x, y){
    this.draw(x - this._width / 2, y - this._height / 2);
  };

  /* draw */
  prototype.drawBottom = function(x, y, margin){
    var width = this._width;
    var height = this._height;
    var xSrc = this._index * width;
    var ySrc = margin;

    this._image.draw(x, y + margin, xSrc, ySrc, width, height - margin);
  };
  return ImageSingle;
};

ig.module('game.imageSingle'
).requires(
).defines(
	function(){
		imageSingle = _ImageSingle();
	}
);


