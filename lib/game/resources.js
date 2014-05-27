/*
 * Create image resources from the image definitions in the settings.
 *
 * methods:
 *  - ::ctor()
 *
 * attributes:
 *  - images
 */
var _Resources = function(){
	var ImageSingle = imageSingle;
	var Settings    = settings;

  Resources.displayName = 'Resources';
  var prototype = Resources.prototype, constructor = Resources;

  function Resources(){
    var images = {};

		var defs = Settings.imageDefinitions
		var id, def, img, i$, to$;
    for (id in defs) {
      def = defs[id];
      switch (def.type) {
      case 'full':
        img = new ig.Image(def.path);
        img.drawCentre = function(x, y){
          this.draw(x - this.width / 2, y - this.height / 2);
        };
				break;

      case 'single':
        img = new ImageSingle(def);
				break;

      case 'array':
				img = []
        for (i$ = 0, to$ = def.size; i$ < to$; ++i$) {
          img.push(new ImageSingle({
            path  : def.path,
            index : def.index + i$,
            width : def.width,
            height: def.height
          }));
        }
        break;

      default:
        throw new Error();
      }

      images[id] = img;
    }

    this.images = images;
  }

  return Resources;
};

ig.module('game.resources'
).requires(
	'game.imageSingle',
	'game.settings'
).defines(
	function(){
		resources = _Resources();
	}
);

