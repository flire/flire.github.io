function createScene() {
	var canvas = document.getElementById('babylonCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var sceneB = new BABYLON.Scene(engine);
	var camera = new BABYLON.ArcRotateCamera("camera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), sceneB);

	var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), sceneB);
	light.diffuse = new BABYLON.Color3(1, 0, 0);
	light.specular = new BABYLON.Color3(1, 1, 1);

	var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, sceneB);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", sceneB);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", sceneB);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skybox.material = skyboxMaterial;

	// var box = babylon.mesh.createbox("box", 3.0, sceneb);
	// var material = new babylon.standardmaterial("texture", sceneb);
	// box.material = material;
	// material.diffusetexture = new babylon.texture("texture.gif", sceneb);

	sceneB.activeCamera.attachControl(canvas);
	
	var loader = new BABYLON.AssetsManager(sceneB);
	var bunny = loader.addMeshTask("bunny", "", "", "bunny_with_normals.obj");
	bunny.onSuccess = function (task) {
		bunnymesh = task.loadedMeshes[0];
		bunnymesh.position = new BABYLON.Vector3(0, 0, 0);
		bunnymesh.scaling.x = 30;
		bunnymesh.scaling.y = 30;
		bunnymesh.scaling.z = 30;
		
		var mirrorMaterial = new BABYLON.StandardMaterial("scybox_refl", sceneB);
		// mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirror", 512, sceneB, true);
		// mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1.0, 0, -10.0);
		// mirrorMaterial.reflectionTexture.renderList = [skybox];
		mirrorMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", sceneB);
		mirrorMaterial.alpha = 1;
		mirrorMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1); 
		mirrorMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); 
		
		mirrorMaterial.reflectionTexture.level = 1;
		mirrorMaterial.specularPower = 150;
		
		bunnymesh.material = mirrorMaterial;
	}
	
	loader.load();

	engine.runRenderLoop(function () {
		sceneB.render();
	});
}

function init() {
    canvas = document.getElementById("babylonCanvas");
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
    canvasW = canvas.width;
    canvasH = canvas.height;
	
	createScene();
}