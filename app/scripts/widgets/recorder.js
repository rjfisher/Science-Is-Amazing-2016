define([
  'esri/core/watchUtils',
  'esri/core/Scheduler',
  'dojo/on',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dojo/dom-class',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/recorder.html'
], function(watchUtils, Scheduler, on, lang, declare, domClass, _WidgetBase,
  _TemplatedMixin, template) {

  'use strict';

  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    constructor: function() {
      this.cameras = [null];
      this.timer = null;
      this.watcher = null;
      this.handler = null;
      this.intervalID = null;
      this.isPlaying = false;
    },

    clear: function() {
      if (this.watcher) {
        this.watcher.remove();
      }
      if (this.handler) {
        this.handler.remove();
      }
      if (this.timer) {
        this.timer.remove();
      }
      this.recordStart();
    },

    recordStart: function() {
      if (this.isPlaying || this.isPaused) {
        return;
      }

      var self = this;

      this.timer = Scheduler.schedule(function() {
        self.cameraWatch();
        self.sliderWatch();
      });
    },

    play: function() {
      if (this.isPlaying) {
        return;
      }
      domClass.toggle(this.playBtn, 'btn-info btn-success');
      this._play(false);
    },

    stop: function() {
      this.isPaused = !this.isPaused;
      domClass.toggle(this.stopBtn, 'btn-info btn-danger');
      if (!this.isPaused) {
        this.recordStart();
      }
    },

    playReverse: function() {
      if (this.isPlaying) {
        return;
      }
      domClass.toggle(this.reverseBtn, 'btn-info btn-success');
      this._play(true);
    },

    cameraWatch: function() {
      var view = this.get('view');
      var cameras = this.cameras;
      var slider = this.slider;
      this.watcher = view.watch('camera', function(val) {
        cameras.push(val.clone());
        slider.max = slider.value = cameras.length;
        this.clear();
      }.bind(this));
    },

    sliderWatch: function() {
      var view = this.get('view');
      var cameras = this.cameras;
      this.handler = on(this.slider, 'input', function(e) {
        var val = parseInt(e.target.value);
        view.camera = cameras[val] || view.camera.clone();
        this.clear();
      }.bind(this));
    },

    _play: function(inReverse) {
      this.isPlaying = true;
      var intervalID = this.intervalID;
      var slider = this.slider;
      var view = this.view;
      var cameras = this.cameras;
      var len = cameras.length;

      var i = 0;
      intervalID = setInterval(function() {
        if (!inReverse) {
          slider.value = i;
          view.camera = cameras[i++] || view.camera.clone();
          if (i === len) {
            clearInterval(intervalID);
            domClass.toggle(this.playBtn, 'btn-info btn-success');
            this.isPlaying = false;
            this.recordStart();
          }
        } else {
          slider.value = len;
          view.camera = cameras[len--] || view.camera.clone();
          if (len < 1) {
            clearInterval(intervalID);
            domClass.toggle(this.reverseBtn, 'btn-info btn-success');
            this.isPlaying = false;
            this.recordStart();
          }
        }
      }.bind(this), 15);
    }
  });
});
