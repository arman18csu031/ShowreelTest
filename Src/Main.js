import * as Database from "./Database.js"

let StartPos;
let EndPos;
let raycasting;
let reticle=null;
let mainModel = null;
let texture = null;
let videoMaterial = null;
let element = document.getElementById("video");

// get the canvas DOM element
var canvas = document.getElementById("renderCanvas");

// load the 3D engine
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
let assetManager = new BABYLON.AssetsManager(scene);
 
var loadScene = function() {
  //load glb scene of roadshow
  let task=assetManager.addMeshTask("Main Model Task", "", "./Static/Models/", "Theatre_Rebake _ Baked.glb");
  task.onSuccess = (task) => {
    mainModel=task.loadedMeshes[0];
    }
};

// Set the basics
scene.debugLayer.show();
var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 1, 2), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
camera.rotation = new BABYLON.Vector3(ConverttoRadians(2.31), ConverttoRadians(180.47), 0);


var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
light.intensity = 0.5;

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});

loadScene();

let textureTask = assetManager.addTextureTask("Reticle", "/Static/Reticle/Reticle_Gray.png");
textureTask.onSuccess=(task)=>{
  texture = task.texture;
}

let mouse = new BABYLON.Vector2();

assetManager.onFinish = () => {

  engine.runRenderLoop(() => {
    scene.render(camera);
  });

  for (let index = 0; index < mainModel._children.length; index++) {
    const element = mainModel._children[index];
    if (element.name == "Wooden_Floor") {
      element.metadata = "HIT";
    }

    else if(element.name == "Screen"){
      element.metadata = "VIDEO";
    }

    else if(element.name == "Full_screen"){
      element.metadata = "fullScreen";
  }
  LoadData();
}
}

assetManager.load();

//Raycast Initialisation
scene.onPointerDown = () => {
  Raycasting();
 }

function Raycasting(){
  let pickResult = scene.pick(scene.pointerX, scene.pointerY);
  if(pickResult.pickedMesh && pickResult.pickedMesh.metadata=="HIT"){
    raycasting=pickResult.hit;
    let HitPoint = pickResult.pickedPoint;
    EndPos = new BABYLON.Vector3( HitPoint.x, camera.position.y,  HitPoint.z);
    StartPos= new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z);
  BABYLON.Animation.CreateAndStartAnimation("Animation", camera, "position", 60, 120, StartPos, EndPos, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
  }

  else if (pickResult.pickedMesh && pickResult.pickedMesh.metadata == "VIDEO") {
    if (videoMaterial)
    {
      if (videoMaterial.diffuseTexture.video.paused)
      {
  videoMaterial.diffuseTexture.video.play();
        }
      else {
  videoMaterial.diffuseTexture.video.pause();
        }
      }
      
  }
  else if (pickResult.pickedMesh && pickResult.pickedMesh.name == "Full_screen")
  {
    if (element.requestFullscreen)
    {
      element.requestFullscreen();
      let currentVideoTime = videoMaterial.diffuseTexture.video.currentTime;
      element.currentTime = currentVideoTime;
    }
     if (videoMaterial.diffuseTexture.video.paused)
      {
         element.pause();
        }
      else {
           element.play();

        }
  }
  }
  

function ConverttoRadians(degree) {
  return (Math.PI/180) * degree;
}

//Function which loads data into Database.
async function LoadData(){
  const videoTex = await new BABYLON.VideoTexture("video", "./Static/VideoTexture/Video_Texture.mp4", scene, true);
  Database.Data.push({
    Video_Texture:videoTex,
  })
  videoMaterial=SetData();
}

//Function which sets Data after Loading.
function SetData() {
  const video = scene.getMeshByName("Screen");
  let video_material = new BABYLON.StandardMaterial("VideoTexture", scene);
  video_material.diffuseTexture = Database.Data[0].Video_Texture;
  video_material.emissiveColor=new BABYLON.Color3.White();
  video_material.diffuseColor = new BABYLON.Color3.Black();
  video_material.specularColor=new BABYLON.Color3.Black();
  video.material = video_material;
  video_material.diffuseTexture.video.autoplay = false;
  return video_material;
}



/*scene.getTransformNodeByName("emergency_button.001_primitive3")
scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERTAP:
                if (allowMovement && pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                    smoothMoveTo(pointerInfo.pickInfo)
                }
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                if (rotating) {
                    rotating = false;

                    function DoMove(from, to, duration) {
                      animduration = duration * 30;
                      BABYLON.Animation.CreateAndStartAnimation('camMove', currentCam, 'position', 30, animduration, from, to, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                  }
                  function smoothMovementForced(pickedPoint) {
                      var newPos = new BABYLON.Vector3(pickedPoint.x, pickedPoint.y + 1.5, pickedPoint.z)
                      DoMove(currentCam.position, newPos, 1.2);
                      // console.log(4)
                      rotating = true; }
              }*/
            