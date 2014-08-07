# Usage
Usage is pretty straight forward, first you need to include
`backbone.modalview.js` and `backbone.modalview.css`, then you can simply 
invoke a modal as follows:

    var view = new Backbone.ModalView({
      modalContent: 'Hello, World!'
    });

Because `ModalView` extends from `View` you get everything you would in a
regular view.

For the full API documentation you can run `yuidoc` from the repository folder
to build a `doc/` directory with specific documentation on the full API.

# Extending ModalView
If you want to extend ModalView to add custom functionality you can do so as
follows:


  var MySuperModalView = Backbone.ModalView.extend({

    initialize: function (options) {
      // Call base constructor in this context
      Backbone.ModalView.prototype.initialize.apply(this, arguments);

      // Your code here...
    }

  });

# Styling the modal
Just modify `backbone.modalview.css` as needed, it's designed to be simple to
understand and modify.

# Versioning
**Backbone.ModalView** uses [Semantic Versioning](http://semver.org/), which
quoting from their website can be easily defined as follows:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
> 1. MAJOR version when you make incompatible API changes,
> 2. MINOR version when you add functionality in a backwards-compatible manner, and
> 3. PATCH version when you make backwards-compatible bug fixes.
>
> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

