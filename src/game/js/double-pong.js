import {
	Clock,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	PlaneGeometry,
	MeshStandardMaterial,
	Mesh,
	TextureLoader,
	CubeTextureLoader,
	AmbientLight,
	DirectionalLight,
	SpotLight,
	DirectionalLightHelper,
	CameraHelper,
	BoxGeometry,
	OctahedronGeometry,
	SphereGeometry,
	Vector3,
	MathUtils,
	DoubleSide,
	MeshBasicMaterial} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {
	getScore,
	loadScoreMeshes} from './scores.js';
import {GUI} from 'dat.gui';
import * as colors from './colors.js';
import AI_L1 from '../avatars/AI_L1.jpeg';
import AI_L2 from '../avatars/AI_L2.jpeg';
import AI_L3 from '../avatars/AI_L3.jpeg';
import AI_L4 from '../avatars/AI_L4.png';
// import background1 from '../backgrounds/.jpeg';

// Touch
let fieldWidth = 34;
let halfFieldWidth = fieldWidth / 2;
let fieldHeight = 34;
let halfFieldHeight = fieldHeight / 2;
let height = 1;
let chunkSizeX = fieldWidth / 10;
let chunkSizeY = fieldHeight / 10;
let paddleLength = 2;
let halfPaddleLength = paddleLength / 2;
let paddleWidth = 0.4;
let paddleWallDist = 2;
let ballRadius = 0.3;
let ballMaxAngle = Math.PI / 3; // 60 degrees
let paddleSpeed = 1.5;
let maxSpeed = 30;
let minSpeed = 20;
let ballHitSpeed = 1.5;
let ballInitialSpeed = ballHitSpeed * 10;
let defaultCameraZ = 55;
let defaultCameraY = 0;
let orbitRadius = 15;
let orbitAngle = Math.PI / 16;
let orbitY = orbitRadius * Math.cos(orbitAngle);
let tabletSize = 5;
let pic1;
let pic2;
let pic3;
let pic4;
let camTime = 0;
let camOrbit = 20;
let camOrbitSpeed = 0.0;
let aiError = 1;
// DON'T TOUCH
let ballSpeed = 0;
let paddleTotalDistX = halfFieldWidth - paddleWallDist - paddleWidth / 2;
let paddleTotalDistY = halfFieldHeight - paddleWallDist - paddleWidth / 2;
let lerpStep = 0.1;
let ballDirection = 0;
let oldBallPosX = 0;
let oldBallPosY = 0;
let dX = 0;
let dY = 0;
let text1;
let text2;
let text3;
let text4;
let lightsOn;
let ready;
let startCam;
let start;
let clock;
let delta;
let ticks;
let interval;
let chunks;
let lastHit = -1;
// For testing specific palettes
let color = colors.vapor_wave;
// let color = colors.selectRandomPalette();

let scores;
let scoreboard;
let bounceCount;
let cpu;
let timer;
let matchTime;

// Basics
let renderer;
let scene;
let camera;
let planeGeometry;
let planeMaterial;
let plane;
let ambientLight;
let directionalLight;
let spotlight1;
let standardMaterial;
let scoreboardMaterial;
let boxGeometry1;
let boxGeometry2;
let box_t;
let box_b;
let chunks_r;
let chunks_l;
let cornerGeometry;
let corner1;
let corner2;
let corner3;
let corner4;
let paddleLeftGeometry;
let paddleRightGeometry;
let paddleMaterial;
let paddleLeft;
let paddleRight;
let sphereGeometry;
let sphereMaterial;
let sphere;
let imgLoader;
let meshPromises;
let loader;

// Key states
let keys = {
	ArrowUp: false,
	ArrowDown: false,
	w: false,
	s: false,
	n: false,
	m: false,
	o: false,
	p: false
};

function prepareBasics(){
	// Create renderer instance with antialias
	renderer = new WebGLRenderer({antialias: true});

	// Enable shadows
	renderer.shadowMap.enabled = true;

	// Change the background color
	renderer.setClearColor(color.background);

	// Define the size of the renderer
	renderer.setSize(window.innerWidth, window.innerHeight);

		// Check for old canvas and remove it to start a new game by appending a new one
		let gameContainer = document.getElementById('double-pong');
		let oldGame = gameContainer.querySelector('.renderer');
		if (oldGame)
			gameContainer.removeChild(oldGame);
		gameContainer.appendChild(renderer.domElement);
		renderer.domElement.classList.add('renderer');

		// Use this instead of the above when running directly with parcel
		// Inject canvas element into the page
		// document.body.appendChild(renderer.domElement);

	// Add background
	scene = new Scene();

	// Set background image
	// const backgroundLoader = new TextureLoader();
	// const backgroundLoader = new CubeTextureLoader();
	// scene.background = backgroundLoader.load([
	// 	background1,
	// 	background1,
	// 	background1,
	// 	background1,
	// 	background1,
	// 	background1
	// ]);
	// texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	// scene.background = texture;

	// Add camera
	camera = new PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	// Change camera position along the x, y ands z axes
	camera.position.set(0, -10, 1);
	camera.lookAt(0, 0, 0);

	// Instantiate the orbit control class with the camera
	// COMMENT
	// const orbit = new OrbitControls(camera, renderer.domElement);

	// Whenever the camera position is changed, orbit MUST update
	// COMMENT
	// orbit.update();

	// Simple coordinate guide
	// COMMENT
	// const axesHelper = new AxesHelper(5);
	// scene.add(axesHelper);
}

function preparePlane(){
	planeGeometry = new PlaneGeometry(fieldWidth, fieldHeight);
	planeMaterial = new MeshStandardMaterial({color: color.field, side: DoubleSide});
	plane = new Mesh(planeGeometry, planeMaterial);
	scene.add(plane);

	// Plane receives shadows
	plane.receiveShadow = true;
}

function prepareLights(){
	// Adding ambient light
	ambientLight = new AmbientLight(0x666666);
	ambientLight.intensity = 0;
	scene.add(ambientLight);

	// Directional light
	directionalLight = new DirectionalLight(0xFFFFFF, 0);
	scene.add(directionalLight);

	directionalLight.position.set(0, -30, 50);
	// Light must cast shadows, otherwise the rest of the shadow configurations won't work
	directionalLight.castShadow = true;
	// Increasing the size of the the shadow camera
	directionalLight.shadow.camera.top = halfFieldHeight;
	directionalLight.shadow.camera.bottom = -halfFieldHeight;
	directionalLight.shadow.camera.right = halfFieldWidth + height;
	directionalLight.shadow.camera.left = -halfFieldWidth - height;

	// Spotlight
	spotlight1 = new SpotLight(0xFFFFFF, 400);
	spotlight1.angle = 0;
	spotlight1.position.set(0, orbitY, orbitRadius * Math.sin(orbitAngle));
	scene.add(spotlight1);

	// Add directional light helper to visualize source
	// Second argument defines the size
	// const dLIghtHelper = new DirectionalLightHelper(directionalLight, 5);
	// scene.add(dLIghtHelper);

	// Add helper for the shadow camera
	// const dLightShadowHelper = new CameraHelper(directionalLight.shadow.camera);
	// scene.add(dLightShadowHelper);
}

function prepareField(){
	// Standard material for reuse
	standardMaterial = new MeshStandardMaterial({color: color.walls});
	scoreboardMaterial = new MeshStandardMaterial({color: color.points});

	// Adding boxes for edges
	boxGeometryX = new BoxGeometry(height, chunkSizeX, height);
	boxGeometryY = new BoxGeometry(height, chunkSizeY, height);
	// 10 chunks of sides to later behave as the scoreboard
	chunks_r = {
		box_r10: new Mesh(boxGeometryY, standardMaterial),
		box_r9: new Mesh(boxGeometryY, standardMaterial),
		box_r8: new Mesh(boxGeometryY, standardMaterial),
		box_r7: new Mesh(boxGeometryY, standardMaterial),
		box_r6: new Mesh(boxGeometryY, standardMaterial),
		box_r5: new Mesh(boxGeometryY, standardMaterial),
		box_r4: new Mesh(boxGeometryY, standardMaterial),
		box_r3: new Mesh(boxGeometryY, standardMaterial),
		box_r2: new Mesh(boxGeometryY, standardMaterial),
		box_r1: new Mesh(boxGeometryY, standardMaterial),
	}
	chunks_l = {
		box_l10: new Mesh(boxGeometryY, standardMaterial),
		box_l9: new Mesh(boxGeometryY, standardMaterial),
		box_l8: new Mesh(boxGeometryY, standardMaterial),
		box_l7: new Mesh(boxGeometryY, standardMaterial),
		box_l6: new Mesh(boxGeometryY, standardMaterial),
		box_l5: new Mesh(boxGeometryY, standardMaterial),
		box_l4: new Mesh(boxGeometryY, standardMaterial),
		box_l3: new Mesh(boxGeometryY, standardMaterial),
		box_l2: new Mesh(boxGeometryY, standardMaterial),
		box_l1: new Mesh(boxGeometryY, standardMaterial),
	}
	chunks_t = {
		box_t10: new Mesh(boxGeometryX, standardMaterial),
		box_t9: new Mesh(boxGeometryX, standardMaterial),
		box_t8: new Mesh(boxGeometryX, standardMaterial),
		box_t7: new Mesh(boxGeometryX, standardMaterial),
		box_t6: new Mesh(boxGeometryX, standardMaterial),
		box_t5: new Mesh(boxGeometryX, standardMaterial),
		box_t4: new Mesh(boxGeometryX, standardMaterial),
		box_t3: new Mesh(boxGeometryX, standardMaterial),
		box_t2: new Mesh(boxGeometryX, standardMaterial),
		box_t1: new Mesh(boxGeometryX, standardMaterial),
	}
	chunks_b = {
		box_b10: new Mesh(boxGeometryX, standardMaterial),
		box_b9: new Mesh(boxGeometryX, standardMaterial),
		box_b8: new Mesh(boxGeometryX, standardMaterial),
		box_b7: new Mesh(boxGeometryX, standardMaterial),
		box_b6: new Mesh(boxGeometryX, standardMaterial),
		box_b5: new Mesh(boxGeometryX, standardMaterial),
		box_b4: new Mesh(boxGeometryX, standardMaterial),
		box_b3: new Mesh(boxGeometryX, standardMaterial),
		box_b2: new Mesh(boxGeometryX, standardMaterial),
		box_b1: new Mesh(boxGeometryX, standardMaterial),
	}

	for (let boxNumber in chunks_r){
		scene.add(chunks_r[boxNumber]);
		chunks_r[boxNumber].castShadow = true;
		chunks_r[boxNumber].receiveShadow = true;
	}

	for (let boxNumber in chunks_l){
		scene.add(chunks_l[boxNumber]);
		chunks_l[boxNumber].castShadow = true;
		chunks_l[boxNumber].receiveShadow = true;
	}

	for (let boxNumber in chunks_t){
		scene.add(chunks_t[boxNumber]);
		chunks_t[boxNumber].rotateZ(Math.PI / 2);
		chunks_t[boxNumber].castShadow = true;
		chunks_t[boxNumber].receiveShadow = true;
	}

	for (let boxNumber in chunks_b){
		scene.add(chunks_b[boxNumber]);
		chunks_b[boxNumber].rotateZ(Math.PI / 2);
		chunks_b[boxNumber].castShadow = true;
		chunks_b[boxNumber].receiveShadow = true;
	}

	for (let i = 1; i <= 10; i++){
		chunks_r[`box_r${i}`].position.set(halfFieldWidth + height / 2, halfFieldHeight - (2 * i - 1) * chunkSizeY / 2, height / 2);
		chunks_l[`box_l${i}`].position.set(-halfFieldWidth - height / 2, halfFieldHeight - (2 * i - 1) * chunkSizeY / 2, height / 2);
		chunks_t[`box_t${i}`].position.set(halfFieldWidth - (2 * i - 1) * chunkSizeX / 2, halfFieldHeight + height / 2, height / 2);
		chunks_b[`box_b${i}`].position.set(halfFieldWidth - (2 * i - 1) * chunkSizeX / 2, -halfFieldHeight - height / 2, height / 2);
	}

	chunks = [Object.values(chunks_l), Object.values(chunks_r), Object.values(chunks_t), Object.values(chunks_b)];
}

// Adding fancy corners
function prepareCorners(){
	cornerGeometry = new OctahedronGeometry(height * 0.7, 0);
	corner1 = new Mesh(cornerGeometry, standardMaterial);
	corner2 = new Mesh(cornerGeometry, standardMaterial);
	corner3 = new Mesh(cornerGeometry, standardMaterial);
	corner4 = new Mesh(cornerGeometry, standardMaterial);
	scene.add(corner1);
	scene.add(corner2);
	scene.add(corner3);
	scene.add(corner4);
	corner1.rotateZ(Math.PI / 4);
	corner2.rotateZ(Math.PI / 4);
	corner3.rotateZ(Math.PI / 4);
	corner4.rotateZ(Math.PI / 4);
	corner1.position.set(-halfFieldWidth - height / 2, halfFieldHeight + height / 2, height);
	corner2.position.set(halfFieldWidth + height / 2, halfFieldHeight + height / 2, height);
	corner3.position.set(-halfFieldWidth - height / 2, -halfFieldHeight - height / 2, height);
	corner4.position.set(halfFieldWidth + height / 2, -halfFieldHeight - height / 2, height);
	corner1.castShadow = true;
	corner2.castShadow = true;
	corner3.castShadow = true;
	corner4.castShadow = true;
	corner1.receiveShadow = true;
	corner2.receiveShadow = true;
	corner3.receiveShadow = true;
	corner4.receiveShadow = true;
}

// Adding paddles
function preparePaddles(){
	paddleLeftGeometry = new BoxGeometry(paddleWidth, paddleLength, height);
	paddleRightGeometry = new BoxGeometry(paddleWidth, paddleLength, height);
	paddleTopGeometry = new BoxGeometry(paddleLength, paddleWidth, height);
	paddleBottomGeometry = new BoxGeometry(paddleLength, paddleWidth, height);
	paddleMaterial = new MeshStandardMaterial({color: color.paddles});
	paddleLeft = new Mesh(paddleLeftGeometry, paddleMaterial);
	paddleRight = new Mesh(paddleRightGeometry, paddleMaterial);
	paddleTop = new Mesh(paddleTopGeometry, paddleMaterial);
	paddleBottom = new Mesh(paddleBottomGeometry, paddleMaterial);
	paddleRight.position.set(halfFieldWidth - paddleWallDist, 0, height / 2);
	paddleLeft.position.set(-halfFieldWidth + paddleWallDist, 0, height / 2);
	paddleTop.position.set(0, halfFieldHeight - paddleWallDist, height / 2);
	paddleBottom.position.set(0, -halfFieldHeight + paddleWallDist, height / 2);
	paddleLeft.castShadow = true;
	paddleRight.castShadow = true;
	paddleTop.castShadow = true;
	paddleBottom.castShadow = true;
	paddleLeft.receiveShadow = true;
	paddleRight.receiveShadow = true;
	paddleTop.receiveShadow = true;
	paddleBottom.receiveShadow = true;
	scene.add(paddleLeft);
	scene.add(paddleRight);
	scene.add(paddleTop);
	scene.add(paddleBottom);
}

// Adding ball
function prepareBall(){
	sphereGeometry = new SphereGeometry(ballRadius);
	sphereMaterial = new MeshStandardMaterial({color: color.ball});
	sphere = new Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphere);
	sphere.castShadow = true;
	sphere.receiveShadow = true;
	sphere.position.set(0, 0, ballRadius);
}

function initializeObjs(){
	prepareBasics();
	preparePlane();
	prepareLights();
	prepareField();
	prepareCorners();
	preparePaddles();
	prepareBall();
}

// Adding picture tablets
function createTexturedMeshes() {
	imgLoader = new TextureLoader();

	// Create promises for the texture loading and mesh creation
	meshPromises = [
		new Promise((resolve, reject) => {
			imgLoader.load(AI_L1, function(texture) {
				let geometry = new PlaneGeometry(tabletSize, tabletSize);
				let material = new MeshBasicMaterial({map: texture});
				let mesh = new Mesh(geometry, material);
				resolve(mesh);
			}, undefined, reject);
		}),
		new Promise((resolve, reject) => {
			imgLoader.load(AI_L2, function(texture) {
				let geometry = new PlaneGeometry(tabletSize, tabletSize);
				let material = new MeshBasicMaterial({map: texture});
				let mesh = new Mesh(geometry, material);
				resolve(mesh);
			}, undefined, reject);
		}),
		new Promise((resolve, reject) => {
			imgLoader.load(AI_L3, function(texture) {
				let geometry = new PlaneGeometry(tabletSize, tabletSize);
				let material = new MeshBasicMaterial({map: texture});
				let mesh = new Mesh(geometry, material);
				resolve(mesh);
			}, undefined, reject);
		}),
		new Promise((resolve, reject) => {
			imgLoader.load(AI_L4, function(texture) {
				let geometry = new PlaneGeometry(tabletSize, tabletSize);
				let material = new MeshBasicMaterial({map: texture});
				let mesh = new Mesh(geometry, material);
				resolve(mesh);
			} , undefined, reject);
		})
	];
	// Return a promise that resolves when all the meshes are created
	return Promise.all(meshPromises);
};

function placeLoadedAvatars(){
		scene.add(pic1);
		scene.add(pic2);
		scene.add(pic3);
		scene.add(pic4);
		pic1.position.set(-halfFieldWidth - tabletSize, 0, 0);
		pic2.position.set(halfFieldWidth + tabletSize, 0, 0);
		pic3.position.set(0, halfFieldHeight + tabletSize, 0);
		pic4.position.set(0, -halfFieldHeight - tabletSize, 0);
}

function move(){
	if (!start)
		return;
	let limit = paddleWallDist + paddleWidth + paddleWidth / 2 + halfPaddleLength;
	if (keys.ArrowUp && !keys.ArrowDown && parseFloat(paddleRight.position.y) < halfFieldHeight - limit) {
		paddleRight.position.lerp(new Vector3(paddleRight.position.x, paddleRight.position.y + lerpStep, paddleRight.position.z), paddleSpeed);
	}
	if (keys.ArrowDown && !keys.ArrowUp && parseFloat(paddleRight.position.y) > -halfFieldHeight + limit) {
		paddleRight.position.lerp(new Vector3(paddleRight.position.x, paddleRight.position.y - lerpStep, paddleRight.position.z), paddleSpeed);
	}
	if (keys.w && !keys.s && parseFloat(paddleLeft.position.y) < halfFieldHeight - limit) {
		paddleLeft.position.lerp(new Vector3(paddleLeft.position.x, paddleLeft.position.y + lerpStep, paddleLeft.position.z), paddleSpeed);
	}
	if (keys.s && !keys.w && parseFloat(paddleLeft.position.y) > -halfFieldHeight + limit) {
		paddleLeft.position.lerp(new Vector3(paddleLeft.position.x, paddleLeft.position.y - lerpStep, paddleLeft.position.z), paddleSpeed);
	}
	if (keys.o && !keys.p && parseFloat(paddleTop.position.x) > -halfFieldWidth + limit) {
		paddleTop.position.lerp(new Vector3(paddleTop.position.x - lerpStep, paddleTop.position.y, paddleTop.position.z), paddleSpeed);
	}
	if (keys.p && !keys.o && parseFloat(paddleTop.position.x) < halfFieldWidth - limit) {
		paddleTop.position.lerp(new Vector3(paddleTop.position.x + lerpStep, paddleTop.position.y, paddleTop.position.z), paddleSpeed);
	}
	if (keys.n && !keys.m && parseFloat(paddleBottom.position.x) > -halfFieldWidth + limit) {
		paddleBottom.position.lerp(new Vector3(paddleBottom.position.x - lerpStep, paddleBottom.position.y, paddleBottom.position.z), paddleSpeed);
	}
	if (keys.m && !keys.n && parseFloat(paddleBottom.position.x) < halfFieldWidth - limit) {
		paddleBottom.position.lerp(new Vector3(paddleBottom.position.x + lerpStep, paddleBottom.position.y, paddleBottom.position.z), paddleSpeed);
	}
}

// Defines ball direction at the beginning and resets
function ballStart(){
	sphere.position.set(0, 0, ballRadius);
	ballSpeed = ballInitialSpeed;
	// Direction in radians to later decompose in x and y
	ballDirection = MathUtils.randFloatSpread(2.0 * Math.PI);
}

function checkAlignmentY(paddle){
	return sphere.position.y - ballRadius < paddle.position.y + halfPaddleLength && sphere.position.y + ballRadius > paddle.position.y - halfPaddleLength;
}

function checkAlignmentX(paddle){
	return sphere.position.x - ballRadius < paddle.position.x + halfPaddleLength && sphere.position.x + ballRadius > paddle.position.x - halfPaddleLength;
}

function paddleLeftCollision(){
	return sphere.position.x - ballRadius < -paddleTotalDistX && sphere.position.x - ballRadius > -paddleTotalDistX - paddleWidth;
}

function paddleRightCollision(){
	return sphere.position.x + ballRadius > paddleTotalDistX && sphere.position.x + ballRadius < paddleTotalDistX + paddleWidth;
}

function paddleTopCollision(){
	return sphere.position.y + ballRadius > paddleTotalDistY && sphere.position.y + ballRadius < paddleTotalDistY + paddleWidth;
}

function paddleBottomCollision(){
	return sphere.position.y - ballRadius < -paddleTotalDistY && sphere.position.y - ballRadius > -paddleTotalDistY - paddleWidth;
}

function bounceSpeed(multiplier){
	let speed = ballSpeed * ballHitSpeed * multiplier * (1 + multiplier);
	speed = speed > maxSpeed ? maxSpeed : speed;
	speed = speed < minSpeed ? minSpeed : speed;
	return speed;
}

function bounceX(side, paddle){
	// The multiplier will act as a percentage.
	// The further the ball hits from the center of the paddle, the higher the multiplier
	let multiplier = (sphere.position.y - paddle.position.y) / halfPaddleLength;
	ballSpeed = bounceSpeed(Math.abs(multiplier));
	ballDirection = (sphere.position.y - paddle.position.y) / halfPaddleLength * ballMaxAngle;
	if (side)
		ballDirection = Math.PI - ballDirection;
	bounceCount[side]++;
}

function bounceY(side, paddle){
	let step = sphere.position.x - paddle.position.x;
	let multiplier = step / halfPaddleLength;
	ballSpeed = bounceSpeed(Math.abs(multiplier));
	let ballDirectionAbs = Math.abs(step / halfPaddleLength * ballMaxAngle);
	ballDirection = step > 0 ? Math.PI / 2 - ballDirectionAbs : Math.PI / 2 + ballDirectionAbs;
	if (side)
	{
		ballDirection = step > 0 ? -Math.PI / 2 + ballDirectionAbs : -Math.PI / 2 - ballDirectionAbs;
		bounceCount[2]++;
	}
	else
		bounceCount[3]++;
}

function score(){
	if (lastHit == -1){
		ballStart();
		return;
	}		
	let size = chunks[lastHit].length;
	for (let i = 0; i < size; i++){
		if (chunks[lastHit][i].material === standardMaterial){
			chunks[lastHit][i].material = scoreboardMaterial;
			if (i == size - 1){
				paddleSpeed = 0;
				start = false;
				updateInterval();
				finishGame();
				return;
			}
			scores[lastHit]++;
			scene.remove(scoreboard[lastHit]);
			scoreboard[lastHit] = getScore(scores[lastHit]);
			scoreDisplay();
			lastHit = -1;
			break;
		}
	}
	ballStart();
}

function collision() {
	if (!start)
		return;
	if (checkAlignmentY(paddleLeft) && paddleLeftCollision()){
		bounceX(0, paddleLeft);
		lastHit = 0;
	}
	else if (checkAlignmentY(paddleRight) && paddleRightCollision()){
		bounceX(1, paddleRight);
		lastHit = 1;
	}
	else if (checkAlignmentX(paddleTop) && paddleTopCollision()){
		bounceY(1, paddleTop);
		lastHit = 2;
	}
	else if (checkAlignmentX(paddleBottom) && paddleBottomCollision()){
		bounceY(0, paddleBottom);
		lastHit = 3;
	}
	else if (sphere.position.x + ballRadius >= halfFieldWidth
		|| sphere.position.x - ballRadius <= -halfFieldWidth
		|| sphere.position.y + ballRadius >= halfFieldHeight
		|| sphere.position.y - ballRadius <= -halfFieldHeight){
		score();
	}
}

function updateBallPosition(delta){
	if (!start)
		return;
	const distance = ballSpeed * delta;
	const increment = new Vector3(distance * Math.cos(ballDirection), distance * Math.sin(ballDirection), 0);
	sphere.position.add(increment);
}

function updateGameLogic(delta){
	move();
	updateBallPosition(delta);
	collision();
}

function adjustLights(){
	spotlight1.intensity -= delta * 100;
	if (spotlight1.intensity <= 0){
		scene.remove(spotlight1);
		if (directionalLight.intensity < 1){
			directionalLight.intensity += delta / 2;
			ambientLight.intensity += delta / 2;
		}
		else
			ready = true;
	}
}

function spotlightOrbit(){
	const rotSpeed = 0.02;
	spotlight1.position.y = orbitRadius * Math.cos(orbitAngle);
	spotlight1.position.z = orbitRadius * Math.sin(orbitAngle);
	orbitAngle += rotSpeed;
}

function lights(delta){
	if (spotlight1.angle < Math.PI / 64)
		spotlight1.angle += delta / 75;
	else if (spotlight1.position.y > -orbitY)
		spotlightOrbit();
	else
		lightsOn = true
}

function animateCamera() {
	if (!startCam || start)
		return;
	if (camera.position.z < defaultCameraZ)
		camera.position.lerp(new Vector3(camera.position.x, camera.position.y, camera.position.z + lerpStep * 2), 1);
	if (camera.position.y < defaultCameraY)
		camera.position.lerp(new Vector3(camera.position.x, camera.position.y + lerpStep / 1.2, camera.position.z), 1);
	camera.lookAt(0, 0, 0);
}

function animate() {
	delta = clock.getDelta();
	ticks =  Math.round(delta * 120);
	if (!lightsOn)
		lights(delta);
	else
		adjustLights(delta);
	if (camera.position.z != defaultCameraZ && camera.position.y != defaultCameraY)
	animateCamera();
	cameraMotion();
	for (let i = 0; i < ticks ; i++)
		updateGameLogic(delta / ticks);
	cpuPlayers(cpu[0], cpu[1], cpu[2], cpu[3]);
	// The render method links the camera and the scene
	renderer.render(scene, camera);
}

// COMMENT
// For dat.gui controls
// const gui = new GUI();

// const options = {
// 	ballMaxAngle: 60,
// 	paddleSpeed: 1.5,
// 	maxSpeed: 30,
// 	minSpeed: 20,
// 	ballHitSpeed: 1.5,
// 	ballInitialSpeed: 10,
// 	camOrbit: 20,
// 	camOrbitSpeed: 0,
// 	aiError: 1
// };

// gui.add(options, 'ballMaxAngle').min(30).max(90).step(1).onChange(function(value) {
// 	ballMaxAngle = value * Math.PI / 180;
// });

// gui.add(options, 'paddleSpeed').min(1).max(3).step(0.1).onChange(function(value) {
// 	paddleSpeed = value;
// });

// gui.add(options, 'maxSpeed').min(20).max(50).step(1).onChange(function(value) {
// 	maxSpeed = value;
// });

// gui.add(options, 'minSpeed').min(5).max(30).step(1).onChange(function(value) {
// 	minSpeed = value;
// });

// gui.add(options, 'ballHitSpeed').min(1).max(2).step(0.1).onChange(function(value) {
// 	ballHitSpeed = value;
// });

// gui.add(options, 'ballInitialSpeed').min(1).max(50).step(1).onChange(function(value) {
// 	ballInitialSpeed = value;
// });

// gui.add(options, 'camOrbit').min(0).max(100).step(1).onChange(function(value) {
// 	camOrbit = value;
// });

// gui.add(options, 'camOrbitSpeed').min(0.0).max(0.1).step(0.01).onChange(function(value) {
// 	camOrbitSpeed = value;
// });

// gui.add(options, 'aiError').min(0.1).max(2.0).step(0.1).onChange(function(value) {
// 	aiError = value;
// });

function cameraMotion(){
	if (!start)
		return;
	camTime += camOrbitSpeed;
	camera.position.x = Math.sin(camTime) * camOrbit;
	camera.position.y =  Math.sin(camTime) * Math.cos(camTime) * camOrbit;
	camera.lookAt(0, 0, 0);
}

function onKeyDown(e) {
	if (e.key in keys) {
		keys[e.key] = true;
	}
}

function onKeyUp(e) {
	if (e.key in keys) {
		keys[e.key] = false;
	}
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onSpacePress(e) {
	if (e.code === 'Space' && !startCam && ready) {
		startCam = true;
		scene.remove(text4);
	}
	else if (e.code === 'Space' && startCam && Math.floor(camera.position.z) == defaultCameraZ && Math.floor(camera.position.y) == defaultCameraY) {
		scene.remove(text1);
		scene.remove(text2);
		scene.remove(text3);
		start = true;
		updateInterval();
	}
}

function onSkipAnimation(e) {
	if (!start && e.code === 'KeyY'){
		camera.position.set(0, defaultCameraY, defaultCameraZ);
		camera.lookAt(0, 0, 0);
		scene.remove(spotlight1);
		scene.remove(text4);
		directionalLight.intensity = 1;
		ambientLight.intensity = 1;
		lightsOn = true;
		startCam = true;
		startCam = true;
	}
}

function readyEventListeners() {
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);
	window.addEventListener('resize', onResize);
	window.addEventListener('keydown', onSpacePress);
	window.addEventListener('keydown', onSkipAnimation);
}

function removeEventListeners() {
	window.removeEventListener('keydown', onKeyDown);
	window.removeEventListener('keyup', onKeyUp);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('keydown', onSpacePress);
	window.removeEventListener('keydown', onSkipAnimation);
}

function textDisplay(){
	loader = new FontLoader();
	loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', function(font){
		let textGeometry1 = new TextGeometry('Press space to start', {
			font: font,
			size: 2,
			height: 0.5,
		});
		let textGeometry2 = new TextGeometry('W\n\n\n\nS', {
			font: font,
			size: 1,
			height: 0.5,
		});
		let textGeometry3 = new TextGeometry('   Up arrow\n\n\n\nDown arrow', {
			font: font,
			size: 1,
			height: 0.5,
		});
		let textGeometry4 = new TextGeometry('press space', {
			font: font,
			size: 1,
			height: 0.5,
		});
		let textMaterial = new MeshStandardMaterial({color: color.text});
		text1 = new Mesh(textGeometry1, textMaterial);
		text2 = new Mesh(textGeometry2, textMaterial);
		text3 = new Mesh(textGeometry3, textMaterial);
		text4 = new Mesh(textGeometry4, textMaterial);
		text1.position.set(-12, -5, 10);
		text1.receiveShadow = true;
		text2.position.set(-15.5, 3, 1);
		text2.receiveShadow = true;
		text3.position.set(9, 3, 1);
		text3.receiveShadow = true;
		text4.position.set(-3.6, halfFieldHeight - paddleWallDist, 0.2);
		text4.rotateX(Math.PI / 2);
		scene.add(text1);
		scene.add(text2);
		scene.add(text3);
		scene.add(text4);
	});
}

function scoreDisplay(){
	scoreboard[0].position.set(-halfFieldWidth - tabletSize, -tabletSize, 0);
	scoreboard[1].position.set(halfFieldWidth + tabletSize, -tabletSize, 0);
	scoreboard[2].position.set(tabletSize, halfFieldHeight + tabletSize, 0);
	scoreboard[3].position.set(tabletSize, -halfFieldHeight - tabletSize, 0);
	for (let i = 0; i < 4; i++)
		scene.add(scoreboard[i]);
}

// Get ball position once per second
function getBallPosition(){
	oldBallPosX = sphere.position.x;
	oldBallPosY = sphere.position.y;
}

function updateInterval() {
	if (start) {
		interval = setInterval(getBallPosition, 1000);
	} else if (interval) {
		clearInterval(interval);
	}
}

function checkDirection(){
	dX = sphere.position.x - oldBallPosX;
	dY = sphere.position.y - oldBallPosY;
}

function calcIntersectX(side){
	let m = dY / dX;
	let b = sphere.position.y - m * sphere.position.x;
	let x = side ? paddleTotalDistX : -paddleTotalDistX;
	return m * x + b;
}

function calcIntersectY(side){
	let m = dY / dX;
	let b = sphere.position.y - m * sphere.position.x;
	let y = side ? -paddleTotalDistY : paddleTotalDistY;
	return (y - b) / m;
}

function cpuMove(player, intersect){
	switch(player){
		case 0:
			if (paddleLeft.position.y < intersect + aiError && paddleLeft.position.y > intersect - aiError){
				keys.s = false;
				keys.w = false;
			}
			else if (paddleLeft.position.y < intersect){
				keys.w = true;
				keys.s = false;
			}
			else if (paddleLeft.position.y > intersect){
				keys.s = true;
				keys.w = false;
			}
			break;
		case 1:
			if (paddleRight.position.y < intersect + aiError && paddleRight.position.y > intersect - aiError){
				keys.ArrowDown = false;
				keys.ArrowUp = false;
			}
			else if (paddleRight.position.y < intersect){
				keys.ArrowUp = true;
				keys.ArrowDown = false;
			}
			else if (paddleRight.position.y > intersect){
				keys.ArrowDown = true;
				keys.ArrowUp = false;
			}
			break;
		case 2:
			if (paddleTop.position.x < intersect + aiError && paddleTop.position.x > intersect - aiError){
				keys.o = false;
				keys.p = false;
			}
			else if (paddleTop.position.x < intersect){
				keys.p = true;
				keys.o = false;
			}
			else if (paddleTop.position.x > intersect){
				keys.o = true;
				keys.p = false;
			}
			break;
		case 3:
			if (paddleBottom.position.x < intersect + aiError && paddleBottom.position.x > intersect - aiError){
				keys.m = false;
				keys.n = false;
			}
			else if (paddleBottom.position.x < intersect){
				keys.m = true;
				keys.n = false;
			}
			else if (paddleBottom.position.x > intersect){
				keys.n = true;
				keys.m = false;
			}
			break;
	}
}

function cpuPlayers(left, right, top, bottom){
	checkDirection();
	if (left){
		if (dX > 0)
			cpuMove(0, 0);
		else
			cpuMove(0, calcIntersectX(0));
	}
	if (right){
		if (dX < 0)
			cpuMove(1, 0);
		else
			cpuMove(1, calcIntersectX(1));
	}
	if (top){
		if (dY < 0)
			cpuMove(2, 0);
		else
			cpuMove(2, calcIntersectY(0));
	}
	if (bottom){
		if (dY > 0)
			cpuMove(3, 0);
		else
			cpuMove(3, calcIntersectY(1));
	}
}

function sendData(){
	let results = [scores[0], scores[1], scores[2], scores[3]];
	const data = {
		results: results,
		bounces: bounceCount,
		time: matchTime
	};
	localStorage.setItem('pongData', JSON.stringify(data));
}

function disposeObject(obj) {
	if (obj) {
		if (obj.geometry) {
			obj.geometry.dispose();
		}
		if (obj.material) {
			obj.material.dispose();
		}
		scene.remove(obj);
	}
}

function finishGame(){
	// Stop match clock
	clearInterval(timer);
	// Deep cleaning, nothing left behind
	renderer.setAnimationLoop(null);
	disposeObject(plane);
	disposeObject(ambientLight);
	disposeObject(directionalLight);
	disposeObject(spotlight1);
	Object.values(chunks_r).forEach(disposeObject);
	Object.values(chunks_l).forEach(disposeObject);
	Object.values(chunks_t).forEach(disposeObject);
	Object.values(chunks_b).forEach(disposeObject);
	disposeObject(corner1);
	disposeObject(corner2);
	disposeObject(corner3);
	disposeObject(corner4);
	disposeObject(paddleLeft);
	disposeObject(paddleRight);
	disposeObject(paddleTop);
	disposeObject(paddleBottom);
	disposeObject(sphere);
	disposeObject(pic1);
	disposeObject(pic2);
	disposeObject(pic3);
	disposeObject(pic4);
	disposeObject(text1);
	disposeObject(text2);
	disposeObject(text3);
	disposeObject(text4);
	Object.values(scoreboard).forEach(disposeObject);
	imgLoader = null;
	meshPromises = null;
	removeEventListeners();
	camera = null;
	scene = null;
	renderer.dispose();
	document.getElementById('double-pong').style.display = 'none';
	sendData();
	matchTime = 0;
	bounceCount = [0, 0, 0, 0];
}

function prepVars(){
	clock = new Clock();
	delta = 0;
	ticks = 0;
	lightsOn = false;
	ready = false;
	startCam = false;
	start = false;
	scores = [0, 0, 0, 0];
	scoreboard = [0, 0, 0, 0];
	bounceCount = [0, 0, 0, 0];
	cpu = [0, 0, 0, 0];
	timer = null;
	matchTime = 0;
}

async function main(){
	prepVars();
	initializeObjs();
	readyEventListeners();
	await createTexturedMeshes().then(([mesh1, mesh2, mesh3, mesh4]) => {
		// The avatar meshes are ready
		pic1 = mesh1;
		pic2 = mesh2;
		pic3 = mesh3;
		pic4 = mesh4;
		placeLoadedAvatars();
		ballStart();
		textDisplay();
	}).catch(error => {
		// An error occurred while loading the textures or creating the meshes
		console.error('An error occurred:', error);
	});
	// Wait for the score meshes to load before displaying the score
	await loadScoreMeshes().then(() => {
		scoreboard = [getScore(scores[0]), getScore(scores[0]), getScore(scores[0]), getScore(scores[0])];
		scoreDisplay();
	}).catch(error => {
		console.error('An error occurred while loading the score meshes:', error);
	});
	timer = setInterval(() => {
		matchTime++;
	}, 1000);
	renderer.setAnimationLoop(animate);
}

document.addEventListener('DOMContentLoaded', function() {
	const doubleButton = document.getElementById('start-double-match');
	doubleButton.addEventListener('click', startGame);
	function startGame() {
		cpu = [0, 1, 1, 1];
		document.getElementById('double-pong').style.display = 'block';
		main();
	}
});
