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