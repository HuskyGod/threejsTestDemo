var DEMO = {
  ms_Canvas: null,
  ms_Renderer: null,
  ms_Camera: null,
  ms_Scene: null,
  ms_Controls: null,
  ms_Water: null,
  ms_FilesDND: null,
  ms_Raycaster: null,
  ms_Clickable: [],

  enable: (function enable () {
    try {
      var aCanvas = document.createElement('canvas');
      return !! window.WebGLRenderingContext && (aCanvas.getContext('experimental-webgl'))
    } catch (e) {
      return false
    }
  })(),

  initialize: function initialize (inIdCanvas, inParameters) {
    console.log(inIdCanvas, inParameters)
    this.ms_Canvas = $('#' + inIdCanvas);

    this.ms_Renderer = this.enable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    this.ms_Canvas.html(this.ms_Renderer.domElement)
    this.ms_Scene = new THREE.Scene()

    this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
    this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height)
    this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0))

    this.ms_Raycaster = new THREE.Raycaster()

    this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement)
    this.ms_Controls.userPan = false;
    this.ms_Controls.userPanSpeed = 0.0;
    this.ms_Controls.maxDistance = 5000.0;
    this.ms_Controls.maxPolarAngle = Math.PI * 0.495;

    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(-600, 300, 600)
    this.ms_Scene.add(directionalLight)

    this.loadTerrain(inParameters)

    var waterNormals = new THREE.ImageUtils.loadTexture('../../assets/img/waternormals.jpg')
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

    new Konami(function () {
      if (DEMO.ms_FilesDND === null) {
        var aTextureFDND = THREE.ImageUtils.loadTexture("assets/img/filesdnd_ad.png")
        aTextureFDND.minFilter = THREE.LinearFilter;
        DEMO.ms_FilesDND = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ map: aTextureFDND, transparent: true, side: THREE.DoubleSide }));
        
        DEMO.ms_FilesDND.callback = function () { window.open('http://www.filesdnd.com') }
        DEMO.ms_Clickable.push(DEMO.ms_FilesDND);

        DEMO.ms_FilesDND.position.y = 1200;
        DEMO.ms_Scene.add(DEMO.ms_FilesDND);
      }
    })

    this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
      textureWidth: 512, 
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 	1.0,
      sunDirection: directionalLight.position.normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 50.0
    })

    var aMeshMirror = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
      this.ms_Water.material
    )

    aMeshMirror.add(this.ms_Water)
    aMeshMirror.rotation.x = - Math.PI * 0.5;
    this.ms_Scene.add(aMeshMirror);

    this.loadSkyBox()
  },

  loadSkyBox: function loadSkyBox () {
    var aCubeMap = THREE.ImageUtils.loadTextureCube([
      'assets/img/px.jpg',
      'assets/img/nx.jpg',
      'assets/img/py.jpg',
      'assets/img/ny.jpg',
      'assets/img/pz.jpg',
      'assets/img/nz.jpg'
    ]);
    aCubeMap.format = THREE.RGBFormat;

    var aShader = THREE.ShaderLib['cube']
    aShader.uniforms['tCube'].value = aCubeMap;

    var aSkyBoxMaterial = new THREE.ShaderMaterial({
      fragmentShader: aShader.fragmentShader,
      vertexShader: aShader.vertexShader,
      uniforms: aShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    })

    var aSkybox = new THREE.Mesh(
      new THREE.BoxGeometry(1000000, 1000000, 1000000),
      aSkyBoxMaterial
    )

    this.ms_Scene.add(aSkybox)
  },

  loadTerrain: function loadTerrain (inParameters) {
    var terrainGeo = TERRAINGEN.Get(inParameters)
    var terraninMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide })
    
    var terrain = new THREE.Mesh(terrainGeo, terraninMaterial)
    terrain.position.y = - inParameters.depth * 0.4;
    this.ms_Scene.add(terrain)

    const tree = new THREE.Object3D()

    var Sphere = new THREE.SphereGeometry( 200, 32, 32 );
    var mesh = new THREE.Mesh(Sphere, new THREE.MeshPhongMaterial( {color: 0x00ff00} ))

    var geometry = new THREE.BoxGeometry( 50, 500, 50 );
    new THREE.TextureLoader().load( 'assets/img/tree.jpg', function (texture) {
      console.log('texture', texture)
      var material = new THREE.MeshPhongMaterial( {color: 0x611a00, emissiveMap: texture} );
      var cube = new THREE.Mesh( geometry, material );
      tree.add( cube );
    });
    
    tree.position.x = 200;
    tree.position.z = 1200;

    mesh.position.y = 400;

    tree.add( mesh )

    this.ms_Scene.add(tree)
  },

  display: function display () {
    this.ms_Water.render()
    this.ms_Renderer.render(this.ms_Scene, this.ms_Camera)
  },

  update: function update () {
    if (this.ms_FilesDND != null) {
      this.ms_FilesDND.rotation.y += 0.01;
    }
    this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
    // this.ms_Controls.update()
    this.display()
  },

  resize: function resize (inWidth, inHeight) {
    this.ms_Camera.aspect = inWidth / inHeight;
    this.ms_Camera.updateProjectionMatrix()
    this.ms_Renderer.setSize(inWidth, inHeight)
    this.ms_Canvas.html(this.ms_Renderer.domElement)
    this.display()
  }
}