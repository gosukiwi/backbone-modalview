/* global define */
/**
 * Backbone.ModalView is just a View which is displayed in a modal manner.
 * You can use it just as any other view, this view also has the following
 * methods:
 *
 *  * show: Displays the modal view
 *  * hide: Hides the modal view
 *  * modalHeader: getter and setter for the header part of the modal
 *  * modalContent: getter and setter for the content part of the modal
 *  * modalFooter: getter and setter for the footer part of the modal
 *
 * For more information on the API please look at the docs or generate them
 * using `yuidoc`.
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
     * @constructor
     * @params {Object} options Configuration options for this view, these
     * include:
     *
     *  * modalHeader
     *  * modalContent
     *  * modalFooter
     *
     * For example
     *
     *     var view = new Backbone.ModalView({
     *       modalContent: 'Hello, World!'
     *     });
     */
    initialize: function (options) {
      options = options || {};

      var self = this;
      Object.keys(options).forEach(function (key) {
        if(['modalHeader', 'modalContent', 'modalFooter'].indexOf(key) > -1) {
          self[key] = options[key];
        }
      });

      // Make a getter-setter for modalHeader
      if(this.modalHeader) {
        var header = this.modalHeader;
        this.modalHeader = function (tpl) {
          if(tpl && tpl !== header) {
            header = tpl;
            self.trigger('modal:headerchanged', header);
            return self;
          }

          return header;
        };
      }

      // Make a getter-setter for modalContent
      if(this.modalContent) {
        var content = this.modalContent;
        this.modalContent = function (tpl) {
          if(tpl && tpl !== content) {
            content = tpl;
            self.trigger('modal:contentchanged', content);
            return self;
          }

          return content;
        };
      }

      // Make a getter-setter for modalFooter
      if(this.modalFooter) {
        var footer = this.modalFooter;
        this.modalFooter = function (tpl) {
          if(tpl && tpl !== footer) {
            footer = tpl;
            self.trigger('modal:footerchanged', footer);
            return self;
          }

          return footer;
        };
      }

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
     * Draw all the modal box
     *
     * @method render
     */
    render: function () {
      if(this.modalHeader) {
        this.drawHeader(this.modalHeader());
      }

      if(this.modalContent) {
        this.drawContent(this.modalContent());
      }

      if(this.modalFooter) {
        this.drawFooter(this.modalFooter());
      }
    },

    /**
     * Draw the header to the DOM, this isn't required as long as you use the
     * setter for the header.
     *
     * @method drawHeader
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
     * Creates a modal view with buttons attached.
     *
     * @class ModalConfirmView
     * @constructor 
     * @extends Backbone.ModalView 
     *
     * @param {Object} [options] Configuration options for this view. These
     * include:
     *
     *  * onButtonPressed
     *  * buttons
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
     * @constructor 
     * @extends Backbone.ModalConfirmView 
     *
     * @param {Object} [options] Configuration options for this view. These
     * include:
     *
     *  * yes: A callback function for the
     *  * no
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

    prompt: function (cb) {
      this.cb = cb;
      this.show();
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
