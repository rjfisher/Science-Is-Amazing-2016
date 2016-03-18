var app, searchWidgetNav, searchWidgetPanel;

require(['esri/Map',
  'esri/Basemap',
  'esri/views/MapView',
  'esri/views/SceneView',
  'esri/widgets/Search',
  'esri/core/watchUtils',
  'dojo/query',

  // Custom widgets
  'widgets/recorder',

  // Bootstrap
  'bootstrap/Collapse',
  'bootstrap/Dropdown',
  'bootstrap/Tab',
  'bootstrap/Tooltip',

  // Calcite-maps
  'calcite-maps/calcitemaps',
  'dojo/domReady!'
], function(Map, Basemap, MapView, SceneView, Search,
    watchUtils, query, CameraRecorder) {
  'use strict';

  // App
  app = {
    scale: 50000000,
    center: [-40, 40],
    basemap: 'satellite',
    viewPadding: {
      bottom: 0
    },
    uiPadding: {
      top: 90
    },
    mapView: null,
    sceneView: null,
    activeView: null
  };
  // Map
  var map = new Map({
    basemap: app.basemap
  });
  app.mapView = new MapView({
    container: 'mapViewDiv',
    map: map,
    scale: app.scale,
    center: app.center,
    padding: app.viewPadding,
    ui: {
      components: ['zoom', 'compass', 'attribution'],
      padding: app.uiPadding
    }
  });

  // Scene
  var mapScene = new Map({
    basemap: app.basemap
  });
  app.sceneView = new SceneView({
    container: 'sceneViewDiv',
    map: mapScene,
    scale: app.scale,
    center: app.center,
    padding: app.viewPadding,
    ui: {
      padding: app.uiPadding
    },
    visible: true
  });
  app.activeView = app.sceneView;

  function createSearchWidget(parentId) {
    var search = new Search({
      viewModel: {
        view: app.activeView,
        highlightEnabled: false,
        popupEnabled: false,
        showPopupOnSelect: false
      }
    }, parentId);
    search.startup();
    return search;
  }

  // Search
  app.activeView.then(function() {
    searchWidgetNav = createSearchWidget('searchNavDiv');
    searchWidgetPanel = createSearchWidget('searchPanelDiv');
  });

  var recorder = new CameraRecorder(
    { view: app.activeView }, document.getElementById('recorder')
  );

  recorder.recordStart();



  function syncViews(fromView, toView) {
    function sync() {
      toView.set({
        viewpoint: fromView.viewpoint
      });
    }
    if (toView.isInstanceOf(SceneView) && !toView.ready) {
      watchUtils.whenTrueOnce(toView, 'ready').then(function(isReady) {
        if (isReady) {
          sync();
        }
      });
    } else {
      sync();
    }
  }
  query('nav li a[data-toggle="tab"]').on('click', function(e) {
    // Sync views
    if (e.target.text === 'Map') {
      syncViews(app.sceneView, app.mapView);
      app.activeView = app.mapView;
    } else {
      syncViews(app.mapView, app.sceneView);
      app.activeView = app.sceneView;
    }
    // Set search
    searchWidgetNav.viewModel.view = app.activeView;
    searchWidgetPanel.viewModel.view = app.activeView;
  });
  query('#selectBasemapPanel').on('change', function(e) {
    //mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
    app.mapView.map.basemap = e.target.value;
    app.sceneView.map.basemap = e.target.value;
  });
});
