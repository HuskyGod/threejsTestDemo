var DEMO = {
	ms_DEG2RAD: Math.PI / 100,
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_CameraContainer: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,
	ms_HasDeviceOrientation: false,
	enable: (function enable () {
		try {
			var aCanvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'))
		} catch (e) {
			return false;
		}
	})(),
	initialize: function initialize (inIdCanvas) {
		this.ms_Canvas = $("#" + inIdCanvas)
		this.ms_Canvas.click(function canvasClick () {
			WINDOW.toggleFullScreen()
		})
		this.ms_Renderer = this.enable ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement)
		this.ms_Scene = new THREE.Scene()

		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		var contaioner = new THREE.Object3D();
		contaioner.add(this.ms_Camera)
		this.ms_Scene.add(contaioner)
		contaioner.position.set(0, 15, 0);
		this.ms_Controls = new THREE.DeviceOrientationControls(this.ms_Camera);
		this.ms_Controls.connect();

		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(-400, 100, -500);
		this.ms_Scene.add(directionalLight);

		var waterNormals = new THREE.ImageUtils.loadTexture('../../assets/img/waternormals.jpg')
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 256,
			textureHeight: 256,
			waterNormals: waterNormals,
			alpha: 1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0x001e0f,
			betaVersion: 0
		})
		
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(1500, 1500, 10, 10),
			this.ms_Water.material
		)
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;

		this.ms_Scene.add(aMeshMirror);

		this.loadSkyBox()
	},

	loadSkyBox: function loadSkyBox () {
		var path = 'assets/img/';
		var format = '.jpg';
		var urls = [
			`${path}skybox_0${format}`,
			`${path}skybox_1${format}`,
			`${path}skybox_2${format}`,
			`${path}skybox_3${format}`,
			`${path}skybox_4${format}`,
			`${path}skybox_5${format}`
		];

		var cubeMap = THREE.ImageUtils.loadTextureCube(urls);
		cubeMap.format = THREE.RGBFormat;
		cubeMap.flipY = false;

		var cubeShaber = THREE.ShaderLib['cube'];
		cubeShaber.uniforms['tCube'].value = cubeMap
		
		var skyBoxMaterial = new THREE.ShaderMaterial({
			fragmentShader: cubeShaber.fragmentShader,
			vertexShader: cubeShaber.vertexShader,
			uniforms: cubeShaber.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		})

		var skyBox = new THREE.Mesh(
			new THREE.BoxGeometry(100000, 100000, 100000),
			skyBoxMaterial
		);

		this.ms_Scene.add(skyBox)
	},

	display: function display () {
		this.ms_Water.render()
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera)
	},

	update: function update () {
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0
		this.ms_Controls.update()
		this.display()
	},

	resize: function resize (inWidth, inHeight) {
		this.ms_Camera.aspect = inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight)
		this.ms_Canvas.html(this.ms_Renderer.docElement);
		this.display()
	}
}