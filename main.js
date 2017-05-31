// draw a textured cube using WebGL
//
// written by Louis Vu on October 30, 2016

function start() { "use strict";

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");
    var m4 = twgl.m4;

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 150;
    var slider2 = document.getElementById('slider2');
    slider2.value = 400;

    // Read shader source
    var vertexSource = document.getElementById("vs").text;
    var fragmentSource = document.getElementById("fs").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader)); return null; }

    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader)); return null; }

    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders"); }
    gl.useProgram(shaderProgram);

    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);

    // this gives us access to the matrix uniform
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

    // Data ...

    // vertex positions
    var vertexPos = new Float32Array(
        [  1, 0, 1,  -1, 0, 1,  -1,-2, 1,   1,-2, 1, // front vertices
            1, 0, 1,   1,-2, 1,   1,-2,-1,   1, 0,-1, // right vertices
            1, 0, 1,   1, 0,-1,  -1, 0,-1,  -1, 0, 1, // top vertices
            -1, 0, 1,  -1, 0,-1,  -1,-2,-1,  -1,-2, 1, // left vertices
            -1,-2,-1,   1,-2,-1,   1,-2, 1,  -1,-2, 1, // bottom vertices
            1,-2,-1,  -1,-2,-1,  -1, 0,-1,   1, 0,-1 ]); // back vertices

    // vertex colors
    var vertexColors = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
            0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
            1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
            1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
            0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);

    // element index array
    var triangleIndices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // top
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // bottom
            20,21,22,  20,22,23 ]); // back

    // vertex normals array
    var vertexNormals = new Float32Array(
        [
            // Front
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,

            // Right
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,

            // Top
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,

            // Left
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,

            // Bottom
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,

            // Back
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
        ]);
    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 24;

    // a buffer for colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    colorBuffer.itemSize = 3;
    colorBuffer.numItems = 24;

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

    // create buffer for vertex normals
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    normalBuffer.itemSize = 3;
    normalBuffer.numItems = 24;




    // Data ...

    // vertex positions
    var vertexPos2 = new Float32Array(
        [  1, 2, 1,  -1, 2, 1,  -1,0, 1,   1,0, 1, // front vertices
            1, 2, 1,   1,0, 1,   1,0,-1,   1, 2,-1, // right vertices
            1, 2, 1,   1, 2,-1,  -1, 2,-1,  -1, 2, 1, // top vertices
            -1, 2, 1,  -1, 2,-1,  -1,0,-1,  -1,0, 1, // left vertices
            -1,0,-1,   1,0,-1,   1,0, 1,  -1,0, 1, // bottom vertices
            1,0,-1,  -1,0,-1,  -1, 2,-1,   1, 2,-1 ]); // back vertices

    // vertex colors
    var vertexColors2 = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
            0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
            1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
            1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
            0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);

    // element index array
    var triangleIndices2 = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // top
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // bottom
            20,21,22,  20,22,23 ]); // back

    // vertex normals array
    var vertexNormals2 = new Float32Array(
        [
            // Front
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,

            // Right
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,

            // Top
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,

            // Left
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,

            // Bottom
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,

            // Back
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
        ]);
    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos2, gl.STATIC_DRAW);
    trianglePosBuffer2.itemSize = 3;
    trianglePosBuffer2.numItems = 24;

    // a buffer for colors
    var colorBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors2, gl.STATIC_DRAW);
    colorBuffer2.itemSize = 3;
    colorBuffer2.numItems = 24;

    // a buffer for indices
    var indexBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices2, gl.STATIC_DRAW);

    // create buffer for vertex normals
    var normalBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals2, gl.STATIC_DRAW);
    normalBuffer2.itemSize = 3;
    normalBuffer2.numItems = 24;
    var time = 0;
    var time2 = 0;
    var eyeTime = 0;
    var inc = 1;
    var inc2 = .5;
    // Scene (re-)draw routine
    setInterval(function draw() {
        if (time == -15 || time == 15)  {
            inc = inc*(-1);
            inc2 = inc2*(-1);
        }
        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = time*0.01*Math.PI;
        var angle2 = time*0.01*Math.PI;
        var angle3 = time2*0.01*Math.PI;

        // Circle around the y-axis
        var eye = [slider2.value*Math.sin(eyeTime),slider1.value,slider2.value*Math.cos(eyeTime)];
        var target = [0,0,0];
        var up = [0,1,0];
        var tCamera = m4.inverse(m4.lookAt(eye,target,up));
        var tProjection = m4.perspective(Math.PI/4,1,10,1000);

        // head
        var tModel = m4.multiply(m4.scaling([10,10,10]),m4.axisRotation([1,1,1],0));
        tModel = m4.translate(tModel, [-5, 2, 0]);
        // draw body
        var tModel2 = m4.multiply(m4.scaling([20, 20, 20]), m4.axisRotation([1, 1, 1], 0));
        tModel2 = m4.translate(tModel2, [-2.5, 0, 0]);
// right arm
        // right forearm
        var tModel3 = m4.multiply(m4.scaling([5, 20, 5]), m4.axisRotation([0, 0, 1], angle1));
        //tModel3 = m4.translate(tModel3, [2, 0, 0]);
        // right upperarm
        // var tModel7 = m4.multiply(m4.identity(), m4.axisRotation([1, 0, 0], angle2));
        var tModel7 = m4.multiply(m4.scaling([20, 5, 5]), m4.axisRotation([1, 0, 0], 0));
        tModel7 = m4.translate(tModel7, [-1, 0, 0]);
// left arm
        var tModel4 = m4.multiply(m4.scaling([5, 30, 5]), m4.axisRotation([1, 0, 0], angle1));
        tModel4 = m4.translate(tModel4, [-15, 0, 0]);
        // draw hip
        //var tModel8 = m4.translate(m4.identity(), [-5, -3.5, 0]);
        var tModel8 = m4.multiply(m4.scaling([15, 10, 15]), m4.axisRotation([1, 0, 0], 0));
        tModel8 = m4.translate(tModel8, [-3.5, -4, 0]);

// right leg
        var tModel5 = m4.multiply(m4.scaling([5, 30, 5]), m4.axisRotation([1, 0, 0], -angle3));
        tModel5 = m4.translate(tModel5, [-8, -1.8, 0]);
// left leg
        var tModel6 = m4.multiply(m4.scaling([5, 30, 5]), m4.axisRotation([1, 0, 0], angle3));
        tModel6 = m4.translate(tModel6, [-12, -1.8, 0]);


        var tMVP=m4.multiply(m4.multiply(tModel,tCamera),tProjection);

        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
            gl.FLOAT,false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
            gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, normalBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

        var normalMatrix = m4.multiply(tModel,tCamera);
        normalMatrix = m4.transpose(m4.inverse(normalMatrix));
        shaderProgram.nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
        gl.uniformMatrix4fv(shaderProgram.nUniform, false, normalMatrix);

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
        // Do the drawing
        var tMVP2 = m4.multiply(m4.multiply(tModel2, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP2);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
        // Do the drawing
       /* var tMVP3 = m4.multiply(m4.multiply(tModel3, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP3);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);*/
        // Do the drawing
        var tMVP4 = m4.multiply(m4.multiply(tModel4, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP4);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
        // Do the drawing
        var tMVP5 = m4.multiply(m4.multiply(tModel5, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP5);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
        // Do the drawing
        var tMVP6 = m4.multiply(m4.multiply(tModel6, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP6);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
                // drawing right forearm
        var tMVP7 = m4.multiply(m4.multiply(tModel7, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP7);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
                        // drawing left forearm
        var tMVP8 = m4.multiply(m4.multiply(tModel8, tCamera), tProjection);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP8);
        gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);

//Draw Body
        // Set up uniforms & attributes

        /*  gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);

         gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
         gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);
         gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer2);
         gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);
         gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer2);
         gl.vertexAttribPointer(shaderProgram.NormalAttribute, normalBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);

         var normalMatrix2 = m4.multiply(tModel2, tCamera);
         normalMatrix2 = m4.transpose(m4.inverse(normalMatrix2));
         shaderProgram.nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
         gl.uniformMatrix4fv(shaderProgram.nUniform, false, normalMatrix2);*/



        //Draw right arm
        // Set up uniforms & attributes
           var tMVP3 = m4.multiply(m4.multiply(tModel3, tCamera), tProjection);
         gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP3);

         gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
         gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);
         gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer2);
         gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);
         gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer2);
         gl.vertexAttribPointer(shaderProgram.NormalAttribute, normalBuffer2.itemSize,
         gl.FLOAT, false, 0, 0);

         var normalMatrix2 = m4.multiply(tModel3, tCamera);
         normalMatrix2 = m4.transpose(m4.inverse(normalMatrix2));
         shaderProgram.nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
         gl.uniformMatrix4fv(shaderProgram.nUniform, false, normalMatrix2);

         // Do the drawing
         gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
        time = time + inc;
        time2 = time2 + inc2;
        eyeTime = eyeTime + .01;
    },25);

    //slider1.addEventListener("input",draw);
    //slider2.addEventListener("input",draw);
    //draw();
}
