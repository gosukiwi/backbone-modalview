/* global define */
/**
 * This file implements ModalView and some related classes to work with Modals
 * in Backbone. The only dependency is the attached `.css` file but you could
 * always see the markup and implement your own version or extend this one.
 *
 * For more information on the API please look at the docs or generate them
 * using `yuidoc` with no arguments.
 *
 * @author: Federico Ramirez <fedra.arg@gmail.com>
 * @licence: MIT
 */
(function(root, modalViewFactory, modalConfirmViewFactory, modalPromptViewFactory) {
  'use strict';

  // Check for AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore', 'jquery'], function(Backbone, _, $) {
      Backbone.ModalView = modalViewFactory(Backbone, _, $);
      Backbone.ModalConfirmView = modalConfirmViewFactory(Backbone, _, $);
      Backbone.ModalPromptView = modalPromptViewFactory(Backbone, _, $);
    });

  // Not AMD? Assume browser
  } else {
    root.Backbone.ModalView = modalViewFactory(root.Backbone, root._, (root.jQuery || root.Zepto || root.ender || root.$));
    root.Backbone.ModalConfirmView = modalConfirmViewFactory(root.Backbone, root._, (root.jQuery || root.Zepto || root.ender || root.$));
    root.Backbone.ModalPromptView = modalPromptViewFactory(root.Backbone, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(Backbone, _, $) {
  'use strict';

  // We use pubsub to communicate between the markup and the backbone view
  var pubsub = _.extend({}, Backbone.Events);

  // Helper class for markup creation
  function ModalMarkup() {
    this.$overlay      = $('<div class="backbone-modal-overlay"></div>');
    this.$modal        = $('<div class="backbone-modal-container"></div>');
    this.$modalHeader  = $('<h1 class="backbone-modal-header" />');
    this.$modalContent = $('<div class="backbone-modal-content" />');
    this.$modalFooter  = $('<div class="backbone-modal-footer" />');

    this.$modal
      .append(this.$modalHeader)
      .append(this.$modalContent)
      .append(this.$modalFooter);
    this.$overlay
      .append(this.$modal);
    $('body').append(this.$overlay);

    // Bind modal events
    this.$overlay.click(function () {
      pubsub.trigger('hidemodal');
    });
    this.$modal.click(function (e) {
      e.stopPropagation();
    });
  }

  // ModalView
  // -------------------------------------------------------------------------
  var ModalView = Backbone.View.extend({

    /**
     * Display a Backbone view in a modal fashion.
     *
     * @class ModalView
     * @extends Backbone.View
     * @constructor
     * @params {Object} options Configuration options for this view, these
     * include:
     *
     *  * modalHeader: The HTML content for the header of the modal
     *  * modalContent: The HTML content for the body of the modal
     *  * modalFooter: The HTML content for the footer of the modal
     *
     * For example
     *
     *     var view = new Backbone.ModalView({
     *       modalContent: 'Hello, World!'
     *     });
     */
    initialize: function (options) {
      // Call parent constructor
      Backbone.View.prototype.initialize.apply(this, arguments);

      // Set version number
      this.MODAL_VERSION = '0.0.1';

      var self = this;

      // Make sure the options arguments defaults to an empty object
      options = options || {};

      // For modalHeader, modalContent and modalFooter options make getters and
      // setters named header, content and footer respectively.
      Object.keys(options).forEach(function (key) {
        if(_.contains(['modalHeader', 'modalContent', 'modalFooter'], key)) {
          var name = key.replace('modal', '').toLowerCase();
          self[name] = function (c) {
            if(!c) {
              return options[key];
            }

            options[key] = c;
            self.trigger('modal:' + name + 'changed', c);
          };
        }
      });

      // Pubsub events
      pubsub.on('hidemodal', function () {
        self.hide();
      });

      // Subscribe to events
      this.on('modal:headerchanged', this.drawHeader);
      this.on('modal:contentchanged', this.drawContent);
      this.on('modal:footerchanged', this.drawFooter);

      // Define $el so we can bind events      
      this.markup = new ModalMarkup();
      this.$el = this.markup.$modal;

      // Check for callbacks
      if(_.isFunction(options.onShow)) {
        this.on('modal:show', options.onShow);
      }

      if(_.isFunction(options.onHide)) {
        this.on('modal:hide', options.onHide);
      }

      // Finally render the view into $el
      this.render();
    },

    /**
     * Draw the whole modal box, normally you won't need to call this method
     * manually as long as you use the getters and setters to update the modal
     * content.
     *
     * @method render
     * @protected
     */
    render: function () {
      if(this.header) {
        this.drawHeader(this.header());
      }

      if(this.content) {
        this.drawContent(this.content());
      }

      if(this.footer) {
        this.drawFooter(this.footer());
      }
    },

    /**
     * Draw the header to the DOM, this isn't required as long as you use the
     * setter for the header.
     *
     * @method drawHeader
     * @protected
     * @param {String} The header's text
     */
    drawHeader: function (content) {
      this.markup.$modalHeader.text(content);
    },

    /**
     * Draw the content to the DOM, this isn't required as long as you use the
     * setter for the content.
     *
     * @method drawContent
     * @protected
     * @param {String} The modal's main HTML
     */
    drawContent: function (content) {
      this.markup.$modalContent.html(content);
    },

    /**
     * Draw the footer to the DOM, this isn't required as long as you use the
     * setter for the footer.
     *
     * @method drawFooter
     * @protected
     * @param {String} The footer's HTML content
     */
    drawFooter: function (content) {
      this.markup.$modalFooter.html(content);
    },

    /**
     * Hides this modal.
     *
     * @method hide
     */
    hide: function () {
      this.markup.$overlay.hide();
      this.trigger('modal:hide');
    },

    /**
     * Shows this modal.
     *
     * @method show
     */
    show: function () {
      if(this.markup.$overlay.is(':visible')) {
        throw 'Modal is already beeing displayed.';
      }

      var modal = this.markup.$modal;
      modal.css({ marginTop: -(modal.outerHeight() + 200) });

      this.markup.$overlay.show();

      modal.animate({ marginTop: '30vh' });

      this.trigger('modal:show');
    }

  });

  return ModalView;

}, function (Backbone, _/*, $*/) {
  'use strict';

  // ModalConfirmView 
  // -------------------------------------------------------------------------
  var ModalConfirmView = Backbone.ModalView.extend({

    /**
     * Creates a modal view with buttons in the footer.
     *
     * @class ModalConfirmView
     * @extends Backbone.ModalView 
     * @constructor 
     *
     * @param {Object} [options] Configuration options for this view. These
     * include:
     *
     *  * onButtonPressed: Gets called when the user clicks any button
     *  * buttons: An array of strings defining the buttons to show in the
     *  footer
     *  * all of ModalView's options
     */
    initialize: function (options) {
      Backbone.ModalView.prototype.initialize.apply(this, arguments);

      // If buttons were not defined, use 'OK' and 'Cancel' as default
      if(!_.isArray(options.buttons)) {
        options.buttons = ['OK', 'Cancel'];
      }
      this.buttons = options.buttons;

      // Draw the buttons
      var markup = '';
      options.buttons.forEach(function (button) {
        markup += '<a href="javascript://" class="modal-button" data-name="' + 
          button + '">' + button + '</a>';
      });
      this.modalFooter = markup;
      this.drawFooter(this.modalFooter);

      if(options.onButtonPressed) {
        this.on('button-press', options.onButtonPressed);
      }
    },

    /**
     * An array of strings representing all the buttons in the modal view
     * footer.
     *
     * @property buttons
     * @type Array
     */
    buttons: ['OK', 'Cancel'],

    // Internal event handling for this instance
    events: {
      'click .modal-button': function (e) {
        this.trigger('button-press', $(e.currentTarget));
      }
    }

  });

  return ModalConfirmView;
}, function (Backbone, _/*, $*/) {
  'use strict';

  var ModalPromptView = Backbone.ModalView.extend({

    /**
     * Creates a prompt view
     *
     * @class ModalPromptView
     * @extends Backbone.ModalConfirmView 
     * @constructor 
     *
     * @param {Object} [options] Configuration options for this view. These
     * include:
     *
     *  * all of ModalPromptView's options
     */
    initialize: function (options) {
      Backbone.ModalConfirmView.prototype.initialize.call(this, options);

      // Save the buttons names, we'll need them later on
      this.btnOK      = this.buttons[0];
      this.btnCancel  = this.buttons[1];

      // When the prompt gets a response either accept or cancel
      this.on('confirmed', function () {
        if(_.isFunction(this.cb)) {
          this.cb();
        }

        this.hide();
      });

      this.on('canceled', function () {
        if(_.isFunction(this.cb)) {
          this.cb(1);
        }

        this.hide();
      });
    },


    /**
     * Prompts the alert and when done calls an specified callback with the
     * dialog result.
     * The first parameter of the callback is called `err`, if err evaluates to 
     * true, then the user cancelled the prompt, otherwise she accepted.
     *
     * Example:
     * 
     *     var modal = new Backbone.ModalPromptView({ modalContent: 'Are you sure?' });
     *     modal.prompt(function (err) {
     *       if(err) {
     *         console.log('The user clicked 'Cancel'');
     *       } else {
     *         console.log('The user clicked 'OK'!');
     *       }
     *     });
     *
     * @method prompt
     * @param {Function} callback The function which will be called when the
     * user closes the prompt and chooses an option.     
     */
    prompt: function (cb) {
      this.show();
      this.cb = cb;
    },

    events: {
      'click .modal-button': function (e) {
        var $btn = $(e.currentTarget);
        this.trigger('button-press', $btn);

        if($btn.data('name') === this.btnOK) {
          this.trigger('confirmed');
        } else if($btn.data('name') === this.btnCancel) {
          this.trigger('canceled');
        }
      }
    }

  });

  return ModalPromptView;
}));
