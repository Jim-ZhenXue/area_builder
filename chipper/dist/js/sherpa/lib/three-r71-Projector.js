/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */ THREE.RenderableObject = function() {
    this.id = 0;
    this.object = null;
    this.z = 0;
};
//
THREE.RenderableFace = function() {
    this.id = 0;
    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();
    this.v3 = new THREE.RenderableVertex();
    this.normalModel = new THREE.Vector3();
    this.vertexNormalsModel = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ];
    this.vertexNormalsLength = 0;
    this.color = new THREE.Color();
    this.material = null;
    this.uvs = [
        new THREE.Vector2(),
        new THREE.Vector2(),
        new THREE.Vector2()
    ];
    this.z = 0;
};
//
THREE.RenderableVertex = function() {
    this.position = new THREE.Vector3();
    this.positionWorld = new THREE.Vector3();
    this.positionScreen = new THREE.Vector4();
    this.visible = true;
};
THREE.RenderableVertex.prototype.copy = function(vertex) {
    this.positionWorld.copy(vertex.positionWorld);
    this.positionScreen.copy(vertex.positionScreen);
};
//
THREE.RenderableLine = function() {
    this.id = 0;
    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();
    this.vertexColors = [
        new THREE.Color(),
        new THREE.Color()
    ];
    this.material = null;
    this.z = 0;
};
//
THREE.RenderableSprite = function() {
    this.id = 0;
    this.object = null;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotation = 0;
    this.scale = new THREE.Vector2();
    this.material = null;
};
//
THREE.Projector = function() {
    var _object, _objectCount, _objectPool = [], _objectPoolLength = 0, _vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0, _face, _faceCount, _facePool = [], _facePoolLength = 0, _line, _lineCount, _linePool = [], _linePoolLength = 0, _sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0, _renderData = {
        objects: [],
        lights: [],
        elements: []
    }, _vector3 = new THREE.Vector3(), _vector4 = new THREE.Vector4(), _clipBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)), _boundingBox = new THREE.Box3(), _points3 = new Array(3), _points4 = new Array(4), _viewMatrix = new THREE.Matrix4(), _viewProjectionMatrix = new THREE.Matrix4(), _modelMatrix, _modelViewProjectionMatrix = new THREE.Matrix4(), _normalMatrix = new THREE.Matrix3(), _frustum = new THREE.Frustum(), _clippedVertex1PositionScreen = new THREE.Vector4(), _clippedVertex2PositionScreen = new THREE.Vector4();
    //
    this.projectVector = function(vector, camera) {
        console.warn('THREE.Projector: .projectVector() is now vector.project().');
        vector.project(camera);
    };
    this.unprojectVector = function(vector, camera) {
        console.warn('THREE.Projector: .unprojectVector() is now vector.unproject().');
        vector.unproject(camera);
    };
    this.pickingRay = function(vector, camera) {
        console.error('THREE.Projector: .pickingRay() is now raycaster.setFromCamera().');
    };
    //
    var RenderList = function() {
        var normals = [];
        var uvs = [];
        var object = null;
        var material = null;
        var normalMatrix = new THREE.Matrix3();
        var setObject = function(value) {
            object = value;
            material = object.material;
            normalMatrix.getNormalMatrix(object.matrixWorld);
            normals.length = 0;
            uvs.length = 0;
        };
        var projectVertex = function(vertex) {
            var position = vertex.position;
            var positionWorld = vertex.positionWorld;
            var positionScreen = vertex.positionScreen;
            positionWorld.copy(position).applyMatrix4(_modelMatrix);
            positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);
            var invW = 1 / positionScreen.w;
            positionScreen.x *= invW;
            positionScreen.y *= invW;
            positionScreen.z *= invW;
            vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
        };
        var pushVertex = function(x, y, z) {
            _vertex = getNextVertexInPool();
            _vertex.position.set(x, y, z);
            projectVertex(_vertex);
        };
        var pushNormal = function(x, y, z) {
            normals.push(x, y, z);
        };
        var pushUv = function(x, y) {
            uvs.push(x, y);
        };
        var checkTriangleVisibility = function(v1, v2, v3) {
            if (v1.visible === true || v2.visible === true || v3.visible === true) return true;
            _points3[0] = v1.positionScreen;
            _points3[1] = v2.positionScreen;
            _points3[2] = v3.positionScreen;
            return _clipBox.isIntersectionBox(_boundingBox.setFromPoints(_points3));
        };
        var checkBackfaceCulling = function(v1, v2, v3) {
            return (v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x) < 0;
        };
        var pushLine = function(a, b) {
            var v1 = _vertexPool[a];
            var v2 = _vertexPool[b];
            _line = getNextLineInPool();
            _line.id = object.id;
            _line.v1.copy(v1);
            _line.v2.copy(v2);
            _line.z = (v1.positionScreen.z + v2.positionScreen.z) / 2;
            _line.material = object.material;
            _renderData.elements.push(_line);
        };
        var pushTriangle = function(a, b, c) {
            var v1 = _vertexPool[a];
            var v2 = _vertexPool[b];
            var v3 = _vertexPool[c];
            if (checkTriangleVisibility(v1, v2, v3) === false) return;
            if (material.side === THREE.DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {
                _face = getNextFaceInPool();
                _face.id = object.id;
                _face.v1.copy(v1);
                _face.v2.copy(v2);
                _face.v3.copy(v3);
                _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
                for(var i = 0; i < 3; i++){
                    var offset = arguments[i] * 3;
                    var normal = _face.vertexNormalsModel[i];
                    normal.set(normals[offset], normals[offset + 1], normals[offset + 2]);
                    normal.applyMatrix3(normalMatrix).normalize();
                    var offset2 = arguments[i] * 2;
                    var uv = _face.uvs[i];
                    uv.set(uvs[offset2], uvs[offset2 + 1]);
                }
                _face.vertexNormalsLength = 3;
                _face.material = object.material;
                _renderData.elements.push(_face);
            }
        };
        return {
            setObject: setObject,
            projectVertex: projectVertex,
            checkTriangleVisibility: checkTriangleVisibility,
            checkBackfaceCulling: checkBackfaceCulling,
            pushVertex: pushVertex,
            pushNormal: pushNormal,
            pushUv: pushUv,
            pushLine: pushLine,
            pushTriangle: pushTriangle
        };
    };
    var renderList = new RenderList();
    this.projectScene = function(scene, camera, sortObjects, sortElements) {
        _faceCount = 0;
        _lineCount = 0;
        _spriteCount = 0;
        _renderData.elements.length = 0;
        if (scene.autoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === undefined) camera.updateMatrixWorld();
        _viewMatrix.copy(camera.matrixWorldInverse.getInverse(camera.matrixWorld));
        _viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);
        _frustum.setFromMatrix(_viewProjectionMatrix);
        //
        _objectCount = 0;
        _renderData.objects.length = 0;
        _renderData.lights.length = 0;
        scene.traverseVisible(function(object) {
            if (object instanceof THREE.Light) {
                _renderData.lights.push(object);
            } else if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
                if (object.material.visible === false) return;
                if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {
                    _object = getNextObjectInPool();
                    _object.id = object.id;
                    _object.object = object;
                    _vector3.setFromMatrixPosition(object.matrixWorld);
                    _vector3.applyProjection(_viewProjectionMatrix);
                    _object.z = _vector3.z;
                    _renderData.objects.push(_object);
                }
            }
        });
        if (sortObjects === true) {
            _renderData.objects.sort(painterSort);
        }
        //
        for(var o = 0, ol = _renderData.objects.length; o < ol; o++){
            var object = _renderData.objects[o].object;
            var geometry = object.geometry;
            renderList.setObject(object);
            _modelMatrix = object.matrixWorld;
            _vertexCount = 0;
            if (object instanceof THREE.Mesh) {
                if (geometry instanceof THREE.BufferGeometry) {
                    var attributes = geometry.attributes;
                    var offsets = geometry.offsets;
                    if (attributes.position === undefined) continue;
                    var positions = attributes.position.array;
                    for(var i = 0, l = positions.length; i < l; i += 3){
                        renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                    }
                    if (attributes.normal !== undefined) {
                        var normals = attributes.normal.array;
                        for(var i = 0, l = normals.length; i < l; i += 3){
                            renderList.pushNormal(normals[i], normals[i + 1], normals[i + 2]);
                        }
                    }
                    if (attributes.uv !== undefined) {
                        var uvs = attributes.uv.array;
                        for(var i = 0, l = uvs.length; i < l; i += 2){
                            renderList.pushUv(uvs[i], uvs[i + 1]);
                        }
                    }
                    if (attributes.index !== undefined) {
                        var indices = attributes.index.array;
                        if (offsets.length > 0) {
                            for(var o = 0; o < offsets.length; o++){
                                var offset = offsets[o];
                                var index = offset.index;
                                for(var i = offset.start, l = offset.start + offset.count; i < l; i += 3){
                                    renderList.pushTriangle(indices[i] + index, indices[i + 1] + index, indices[i + 2] + index);
                                }
                            }
                        } else {
                            for(var i = 0, l = indices.length; i < l; i += 3){
                                renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
                            }
                        }
                    } else {
                        for(var i = 0, l = positions.length / 3; i < l; i += 3){
                            renderList.pushTriangle(i, i + 1, i + 2);
                        }
                    }
                } else if (geometry instanceof THREE.Geometry) {
                    var vertices = geometry.vertices;
                    var faces = geometry.faces;
                    var faceVertexUvs = geometry.faceVertexUvs[0];
                    _normalMatrix.getNormalMatrix(_modelMatrix);
                    var material = object.material;
                    var isFaceMaterial = material instanceof THREE.MeshFaceMaterial;
                    var objectMaterials = isFaceMaterial === true ? object.material : null;
                    for(var v = 0, vl = vertices.length; v < vl; v++){
                        var vertex = vertices[v];
                        _vector3.copy(vertex);
                        if (material.morphTargets === true) {
                            var morphTargets = geometry.morphTargets;
                            var morphInfluences = object.morphTargetInfluences;
                            for(var t = 0, tl = morphTargets.length; t < tl; t++){
                                var influence = morphInfluences[t];
                                if (influence === 0) continue;
                                var target = morphTargets[t];
                                var targetVertex = target.vertices[v];
                                _vector3.x += (targetVertex.x - vertex.x) * influence;
                                _vector3.y += (targetVertex.y - vertex.y) * influence;
                                _vector3.z += (targetVertex.z - vertex.z) * influence;
                            }
                        }
                        renderList.pushVertex(_vector3.x, _vector3.y, _vector3.z);
                    }
                    for(var f = 0, fl = faces.length; f < fl; f++){
                        var face = faces[f];
                        var material = isFaceMaterial === true ? objectMaterials.materials[face.materialIndex] : object.material;
                        if (material === undefined) continue;
                        var side = material.side;
                        var v1 = _vertexPool[face.a];
                        var v2 = _vertexPool[face.b];
                        var v3 = _vertexPool[face.c];
                        if (renderList.checkTriangleVisibility(v1, v2, v3) === false) continue;
                        var visible = renderList.checkBackfaceCulling(v1, v2, v3);
                        if (side !== THREE.DoubleSide) {
                            if (side === THREE.FrontSide && visible === false) continue;
                            if (side === THREE.BackSide && visible === true) continue;
                        }
                        _face = getNextFaceInPool();
                        _face.id = object.id;
                        _face.v1.copy(v1);
                        _face.v2.copy(v2);
                        _face.v3.copy(v3);
                        _face.normalModel.copy(face.normal);
                        if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {
                            _face.normalModel.negate();
                        }
                        _face.normalModel.applyMatrix3(_normalMatrix).normalize();
                        var faceVertexNormals = face.vertexNormals;
                        for(var n = 0, nl = Math.min(faceVertexNormals.length, 3); n < nl; n++){
                            var normalModel = _face.vertexNormalsModel[n];
                            normalModel.copy(faceVertexNormals[n]);
                            if (visible === false && (side === THREE.BackSide || side === THREE.DoubleSide)) {
                                normalModel.negate();
                            }
                            normalModel.applyMatrix3(_normalMatrix).normalize();
                        }
                        _face.vertexNormalsLength = faceVertexNormals.length;
                        var vertexUvs = faceVertexUvs[f];
                        if (vertexUvs !== undefined) {
                            for(var u = 0; u < 3; u++){
                                _face.uvs[u].copy(vertexUvs[u]);
                            }
                        }
                        _face.color = face.color;
                        _face.material = material;
                        _face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;
                        _renderData.elements.push(_face);
                    }
                }
            } else if (object instanceof THREE.Line) {
                if (geometry instanceof THREE.BufferGeometry) {
                    var attributes = geometry.attributes;
                    if (attributes.position !== undefined) {
                        var positions = attributes.position.array;
                        for(var i = 0, l = positions.length; i < l; i += 3){
                            renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
                        }
                        if (attributes.index !== undefined) {
                            var indices = attributes.index.array;
                            for(var i = 0, l = indices.length; i < l; i += 2){
                                renderList.pushLine(indices[i], indices[i + 1]);
                            }
                        } else {
                            var step = object.mode === THREE.LinePieces ? 2 : 1;
                            for(var i = 0, l = positions.length / 3 - 1; i < l; i += step){
                                renderList.pushLine(i, i + 1);
                            }
                        }
                    }
                } else if (geometry instanceof THREE.Geometry) {
                    _modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);
                    var vertices = object.geometry.vertices;
                    if (vertices.length === 0) continue;
                    v1 = getNextVertexInPool();
                    v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);
                    // Handle LineStrip and LinePieces
                    var step = object.mode === THREE.LinePieces ? 2 : 1;
                    for(var v = 1, vl = vertices.length; v < vl; v++){
                        v1 = getNextVertexInPool();
                        v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);
                        if ((v + 1) % step > 0) continue;
                        v2 = _vertexPool[_vertexCount - 2];
                        _clippedVertex1PositionScreen.copy(v1.positionScreen);
                        _clippedVertex2PositionScreen.copy(v2.positionScreen);
                        if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {
                            // Perform the perspective divide
                            _clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
                            _clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);
                            _line = getNextLineInPool();
                            _line.id = object.id;
                            _line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
                            _line.v2.positionScreen.copy(_clippedVertex2PositionScreen);
                            _line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);
                            _line.material = object.material;
                            if (object.material.vertexColors === THREE.VertexColors) {
                                _line.vertexColors[0].copy(object.geometry.colors[v]);
                                _line.vertexColors[1].copy(object.geometry.colors[v - 1]);
                            }
                            _renderData.elements.push(_line);
                        }
                    }
                }
            } else if (object instanceof THREE.Sprite) {
                _vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
                _vector4.applyMatrix4(_viewProjectionMatrix);
                var invW = 1 / _vector4.w;
                _vector4.z *= invW;
                if (_vector4.z >= -1 && _vector4.z <= 1) {
                    _sprite = getNextSpriteInPool();
                    _sprite.id = object.id;
                    _sprite.x = _vector4.x * invW;
                    _sprite.y = _vector4.y * invW;
                    _sprite.z = _vector4.z;
                    _sprite.object = object;
                    _sprite.rotation = object.rotation;
                    _sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
                    _sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));
                    _sprite.material = object.material;
                    _renderData.elements.push(_sprite);
                }
            }
        }
        if (sortElements === true) {
            _renderData.elements.sort(painterSort);
        }
        return _renderData;
    };
    // Pools
    function getNextObjectInPool() {
        if (_objectCount === _objectPoolLength) {
            var object = new THREE.RenderableObject();
            _objectPool.push(object);
            _objectPoolLength++;
            _objectCount++;
            return object;
        }
        return _objectPool[_objectCount++];
    }
    function getNextVertexInPool() {
        if (_vertexCount === _vertexPoolLength) {
            var vertex = new THREE.RenderableVertex();
            _vertexPool.push(vertex);
            _vertexPoolLength++;
            _vertexCount++;
            return vertex;
        }
        return _vertexPool[_vertexCount++];
    }
    function getNextFaceInPool() {
        if (_faceCount === _facePoolLength) {
            var face = new THREE.RenderableFace();
            _facePool.push(face);
            _facePoolLength++;
            _faceCount++;
            return face;
        }
        return _facePool[_faceCount++];
    }
    function getNextLineInPool() {
        if (_lineCount === _linePoolLength) {
            var line = new THREE.RenderableLine();
            _linePool.push(line);
            _linePoolLength++;
            _lineCount++;
            return line;
        }
        return _linePool[_lineCount++];
    }
    function getNextSpriteInPool() {
        if (_spriteCount === _spritePoolLength) {
            var sprite = new THREE.RenderableSprite();
            _spritePool.push(sprite);
            _spritePoolLength++;
            _spriteCount++;
            return sprite;
        }
        return _spritePool[_spriteCount++];
    }
    //
    function painterSort(a, b) {
        if (a.z !== b.z) {
            return b.z - a.z;
        } else if (a.id !== b.id) {
            return a.id - b.id;
        } else {
            return 0;
        }
    }
    function clipLine(s1, s2) {
        var alpha1 = 0, alpha2 = 1, // Calculate the boundary coordinate of each vertex for the near and far clip planes,
        // Z = -1 and Z = +1, respectively.
        bc1near = s1.z + s1.w, bc2near = s2.z + s2.w, bc1far = -s1.z + s1.w, bc2far = -s2.z + s2.w;
        if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {
            // Both vertices lie entirely within all clip planes.
            return true;
        } else if (bc1near < 0 && bc2near < 0 || bc1far < 0 && bc2far < 0) {
            // Both vertices lie entirely outside one of the clip planes.
            return false;
        } else {
            // The line segment spans at least one clip plane.
            if (bc1near < 0) {
                // v1 lies outside the near plane, v2 inside
                alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
            } else if (bc2near < 0) {
                // v2 lies outside the near plane, v1 inside
                alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
            }
            if (bc1far < 0) {
                // v1 lies outside the far plane, v2 inside
                alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
            } else if (bc2far < 0) {
                // v2 lies outside the far plane, v2 inside
                alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
            }
            if (alpha2 < alpha1) {
                // The line segment spans two boundaries, but is outside both of them.
                // (This can't happen when we're only clipping against just near/far but good
                //  to leave the check here for future usage if other clip planes are added.)
                return false;
            } else {
                // Update the s1 and s2 vertices to match the clipped line segment.
                s1.lerp(s2, alpha1);
                s2.lerp(s1, 1 - alpha2);
                return true;
            }
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvdGhyZWUtcjcxLVByb2plY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKiBAYXV0aG9yIHN1cGVyZWdnYmVydCAvIGh0dHA6Ly93d3cucGF1bGJydW50LmNvLnVrL1xuICogQGF1dGhvciBqdWxpYW53YSAvIGh0dHBzOi8vZ2l0aHViLmNvbS9qdWxpYW53YVxuICovXG5cblRIUkVFLlJlbmRlcmFibGVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdGhpcy5pZCA9IDA7XG5cbiAgdGhpcy5vYmplY3QgPSBudWxsO1xuICB0aGlzLnogPSAwO1xuXG59O1xuXG4vL1xuXG5USFJFRS5SZW5kZXJhYmxlRmFjZSA9IGZ1bmN0aW9uICgpIHtcblxuICB0aGlzLmlkID0gMDtcblxuICB0aGlzLnYxID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKTtcbiAgdGhpcy52MiA9IG5ldyBUSFJFRS5SZW5kZXJhYmxlVmVydGV4KCk7XG4gIHRoaXMudjMgPSBuZXcgVEhSRUUuUmVuZGVyYWJsZVZlcnRleCgpO1xuXG4gIHRoaXMubm9ybWFsTW9kZWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG4gIHRoaXMudmVydGV4Tm9ybWFsc01vZGVsID0gWyBuZXcgVEhSRUUuVmVjdG9yMygpLCBuZXcgVEhSRUUuVmVjdG9yMygpLCBuZXcgVEhSRUUuVmVjdG9yMygpIF07XG4gIHRoaXMudmVydGV4Tm9ybWFsc0xlbmd0aCA9IDA7XG5cbiAgdGhpcy5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuICB0aGlzLm1hdGVyaWFsID0gbnVsbDtcbiAgdGhpcy51dnMgPSBbIG5ldyBUSFJFRS5WZWN0b3IyKCksIG5ldyBUSFJFRS5WZWN0b3IyKCksIG5ldyBUSFJFRS5WZWN0b3IyKCkgXTtcblxuICB0aGlzLnogPSAwO1xuXG59O1xuXG4vL1xuXG5USFJFRS5SZW5kZXJhYmxlVmVydGV4ID0gZnVuY3Rpb24gKCkge1xuXG4gIHRoaXMucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICB0aGlzLnBvc2l0aW9uV29ybGQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICB0aGlzLnBvc2l0aW9uU2NyZWVuID0gbmV3IFRIUkVFLlZlY3RvcjQoKTtcblxuICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG59O1xuXG5USFJFRS5SZW5kZXJhYmxlVmVydGV4LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKCB2ZXJ0ZXggKSB7XG5cbiAgdGhpcy5wb3NpdGlvbldvcmxkLmNvcHkoIHZlcnRleC5wb3NpdGlvbldvcmxkICk7XG4gIHRoaXMucG9zaXRpb25TY3JlZW4uY29weSggdmVydGV4LnBvc2l0aW9uU2NyZWVuICk7XG5cbn07XG5cbi8vXG5cblRIUkVFLlJlbmRlcmFibGVMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gIHRoaXMuaWQgPSAwO1xuXG4gIHRoaXMudjEgPSBuZXcgVEhSRUUuUmVuZGVyYWJsZVZlcnRleCgpO1xuICB0aGlzLnYyID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKTtcblxuICB0aGlzLnZlcnRleENvbG9ycyA9IFsgbmV3IFRIUkVFLkNvbG9yKCksIG5ldyBUSFJFRS5Db2xvcigpIF07XG4gIHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXG4gIHRoaXMueiA9IDA7XG5cbn07XG5cbi8vXG5cblRIUkVFLlJlbmRlcmFibGVTcHJpdGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdGhpcy5pZCA9IDA7XG5cbiAgdGhpcy5vYmplY3QgPSBudWxsO1xuXG4gIHRoaXMueCA9IDA7XG4gIHRoaXMueSA9IDA7XG4gIHRoaXMueiA9IDA7XG5cbiAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gIHRoaXMuc2NhbGUgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG4gIHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXG59O1xuXG4vL1xuXG5USFJFRS5Qcm9qZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIF9vYmplY3QsIF9vYmplY3RDb3VudCwgX29iamVjdFBvb2wgPSBbXSwgX29iamVjdFBvb2xMZW5ndGggPSAwLFxuICBfdmVydGV4LCBfdmVydGV4Q291bnQsIF92ZXJ0ZXhQb29sID0gW10sIF92ZXJ0ZXhQb29sTGVuZ3RoID0gMCxcbiAgX2ZhY2UsIF9mYWNlQ291bnQsIF9mYWNlUG9vbCA9IFtdLCBfZmFjZVBvb2xMZW5ndGggPSAwLFxuICBfbGluZSwgX2xpbmVDb3VudCwgX2xpbmVQb29sID0gW10sIF9saW5lUG9vbExlbmd0aCA9IDAsXG4gIF9zcHJpdGUsIF9zcHJpdGVDb3VudCwgX3Nwcml0ZVBvb2wgPSBbXSwgX3Nwcml0ZVBvb2xMZW5ndGggPSAwLFxuXG4gIF9yZW5kZXJEYXRhID0geyBvYmplY3RzOiBbXSwgbGlnaHRzOiBbXSwgZWxlbWVudHM6IFtdIH0sXG5cbiAgX3ZlY3RvcjMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuICBfdmVjdG9yNCA9IG5ldyBUSFJFRS5WZWN0b3I0KCksXG5cbiAgX2NsaXBCb3ggPSBuZXcgVEhSRUUuQm94MyggbmV3IFRIUkVFLlZlY3RvcjMoIC0gMSwgLSAxLCAtIDEgKSwgbmV3IFRIUkVFLlZlY3RvcjMoIDEsIDEsIDEgKSApLFxuICBfYm91bmRpbmdCb3ggPSBuZXcgVEhSRUUuQm94MygpLFxuICBfcG9pbnRzMyA9IG5ldyBBcnJheSggMyApLFxuICBfcG9pbnRzNCA9IG5ldyBBcnJheSggNCApLFxuXG4gIF92aWV3TWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKSxcbiAgX3ZpZXdQcm9qZWN0aW9uTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKSxcblxuICBfbW9kZWxNYXRyaXgsXG4gIF9tb2RlbFZpZXdQcm9qZWN0aW9uTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQoKSxcblxuICBfbm9ybWFsTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDMoKSxcblxuICBfZnJ1c3R1bSA9IG5ldyBUSFJFRS5GcnVzdHVtKCksXG5cbiAgX2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4gPSBuZXcgVEhSRUUuVmVjdG9yNCgpLFxuICBfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbiA9IG5ldyBUSFJFRS5WZWN0b3I0KCk7XG5cbiAgLy9cblxuICB0aGlzLnByb2plY3RWZWN0b3IgPSBmdW5jdGlvbiAoIHZlY3RvciwgY2FtZXJhICkge1xuXG4gICAgY29uc29sZS53YXJuKCAnVEhSRUUuUHJvamVjdG9yOiAucHJvamVjdFZlY3RvcigpIGlzIG5vdyB2ZWN0b3IucHJvamVjdCgpLicgKTtcbiAgICB2ZWN0b3IucHJvamVjdCggY2FtZXJhICk7XG5cbiAgfTtcblxuICB0aGlzLnVucHJvamVjdFZlY3RvciA9IGZ1bmN0aW9uICggdmVjdG9yLCBjYW1lcmEgKSB7XG5cbiAgICBjb25zb2xlLndhcm4oICdUSFJFRS5Qcm9qZWN0b3I6IC51bnByb2plY3RWZWN0b3IoKSBpcyBub3cgdmVjdG9yLnVucHJvamVjdCgpLicgKTtcbiAgICB2ZWN0b3IudW5wcm9qZWN0KCBjYW1lcmEgKTtcblxuICB9O1xuXG4gIHRoaXMucGlja2luZ1JheSA9IGZ1bmN0aW9uICggdmVjdG9yLCBjYW1lcmEgKSB7XG5cbiAgICBjb25zb2xlLmVycm9yKCAnVEhSRUUuUHJvamVjdG9yOiAucGlja2luZ1JheSgpIGlzIG5vdyByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSgpLicgKTtcblxuICB9O1xuXG4gIC8vXG5cbiAgdmFyIFJlbmRlckxpc3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbm9ybWFscyA9IFtdO1xuICAgIHZhciB1dnMgPSBbXTtcblxuICAgIHZhciBvYmplY3QgPSBudWxsO1xuICAgIHZhciBtYXRlcmlhbCA9IG51bGw7XG5cbiAgICB2YXIgbm9ybWFsTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDMoKTtcblxuICAgIHZhciBzZXRPYmplY3QgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuXG4gICAgICBvYmplY3QgPSB2YWx1ZTtcbiAgICAgIG1hdGVyaWFsID0gb2JqZWN0Lm1hdGVyaWFsO1xuXG4gICAgICBub3JtYWxNYXRyaXguZ2V0Tm9ybWFsTWF0cml4KCBvYmplY3QubWF0cml4V29ybGQgKTtcblxuICAgICAgbm9ybWFscy5sZW5ndGggPSAwO1xuICAgICAgdXZzLmxlbmd0aCA9IDA7XG5cbiAgICB9O1xuXG4gICAgdmFyIHByb2plY3RWZXJ0ZXggPSBmdW5jdGlvbiAoIHZlcnRleCApIHtcblxuICAgICAgdmFyIHBvc2l0aW9uID0gdmVydGV4LnBvc2l0aW9uO1xuICAgICAgdmFyIHBvc2l0aW9uV29ybGQgPSB2ZXJ0ZXgucG9zaXRpb25Xb3JsZDtcbiAgICAgIHZhciBwb3NpdGlvblNjcmVlbiA9IHZlcnRleC5wb3NpdGlvblNjcmVlbjtcblxuICAgICAgcG9zaXRpb25Xb3JsZC5jb3B5KCBwb3NpdGlvbiApLmFwcGx5TWF0cml4NCggX21vZGVsTWF0cml4ICk7XG4gICAgICBwb3NpdGlvblNjcmVlbi5jb3B5KCBwb3NpdGlvbldvcmxkICkuYXBwbHlNYXRyaXg0KCBfdmlld1Byb2plY3Rpb25NYXRyaXggKTtcblxuICAgICAgdmFyIGludlcgPSAxIC8gcG9zaXRpb25TY3JlZW4udztcblxuICAgICAgcG9zaXRpb25TY3JlZW4ueCAqPSBpbnZXO1xuICAgICAgcG9zaXRpb25TY3JlZW4ueSAqPSBpbnZXO1xuICAgICAgcG9zaXRpb25TY3JlZW4ueiAqPSBpbnZXO1xuXG4gICAgICB2ZXJ0ZXgudmlzaWJsZSA9IHBvc2l0aW9uU2NyZWVuLnggPj0gLSAxICYmIHBvc2l0aW9uU2NyZWVuLnggPD0gMSAmJlxuICAgICAgICAgICBwb3NpdGlvblNjcmVlbi55ID49IC0gMSAmJiBwb3NpdGlvblNjcmVlbi55IDw9IDEgJiZcbiAgICAgICAgICAgcG9zaXRpb25TY3JlZW4ueiA+PSAtIDEgJiYgcG9zaXRpb25TY3JlZW4ueiA8PSAxO1xuXG4gICAgfTtcblxuICAgIHZhciBwdXNoVmVydGV4ID0gZnVuY3Rpb24gKCB4LCB5LCB6ICkge1xuXG4gICAgICBfdmVydGV4ID0gZ2V0TmV4dFZlcnRleEluUG9vbCgpO1xuICAgICAgX3ZlcnRleC5wb3NpdGlvbi5zZXQoIHgsIHksIHogKTtcblxuICAgICAgcHJvamVjdFZlcnRleCggX3ZlcnRleCApO1xuXG4gICAgfTtcblxuICAgIHZhciBwdXNoTm9ybWFsID0gZnVuY3Rpb24gKCB4LCB5LCB6ICkge1xuXG4gICAgICBub3JtYWxzLnB1c2goIHgsIHksIHogKTtcblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFV2ID0gZnVuY3Rpb24gKCB4LCB5ICkge1xuXG4gICAgICB1dnMucHVzaCggeCwgeSApO1xuXG4gICAgfTtcblxuICAgIHZhciBjaGVja1RyaWFuZ2xlVmlzaWJpbGl0eSA9IGZ1bmN0aW9uICggdjEsIHYyLCB2MyApIHtcblxuICAgICAgaWYgKCB2MS52aXNpYmxlID09PSB0cnVlIHx8IHYyLnZpc2libGUgPT09IHRydWUgfHwgdjMudmlzaWJsZSA9PT0gdHJ1ZSApIHJldHVybiB0cnVlO1xuXG4gICAgICBfcG9pbnRzM1sgMCBdID0gdjEucG9zaXRpb25TY3JlZW47XG4gICAgICBfcG9pbnRzM1sgMSBdID0gdjIucG9zaXRpb25TY3JlZW47XG4gICAgICBfcG9pbnRzM1sgMiBdID0gdjMucG9zaXRpb25TY3JlZW47XG5cbiAgICAgIHJldHVybiBfY2xpcEJveC5pc0ludGVyc2VjdGlvbkJveCggX2JvdW5kaW5nQm94LnNldEZyb21Qb2ludHMoIF9wb2ludHMzICkgKTtcblxuICAgIH07XG5cbiAgICB2YXIgY2hlY2tCYWNrZmFjZUN1bGxpbmcgPSBmdW5jdGlvbiAoIHYxLCB2MiwgdjMgKSB7XG5cbiAgICAgIHJldHVybiAoICggdjMucG9zaXRpb25TY3JlZW4ueCAtIHYxLnBvc2l0aW9uU2NyZWVuLnggKSAqXG4gICAgICAgICAgICAoIHYyLnBvc2l0aW9uU2NyZWVuLnkgLSB2MS5wb3NpdGlvblNjcmVlbi55ICkgLVxuICAgICAgICAgICAgKCB2My5wb3NpdGlvblNjcmVlbi55IC0gdjEucG9zaXRpb25TY3JlZW4ueSApICpcbiAgICAgICAgICAgICggdjIucG9zaXRpb25TY3JlZW4ueCAtIHYxLnBvc2l0aW9uU2NyZWVuLnggKSApIDwgMDtcblxuICAgIH07XG5cbiAgICB2YXIgcHVzaExpbmUgPSBmdW5jdGlvbiAoIGEsIGIgKSB7XG5cbiAgICAgIHZhciB2MSA9IF92ZXJ0ZXhQb29sWyBhIF07XG4gICAgICB2YXIgdjIgPSBfdmVydGV4UG9vbFsgYiBdO1xuXG4gICAgICBfbGluZSA9IGdldE5leHRMaW5lSW5Qb29sKCk7XG5cbiAgICAgIF9saW5lLmlkID0gb2JqZWN0LmlkO1xuICAgICAgX2xpbmUudjEuY29weSggdjEgKTtcbiAgICAgIF9saW5lLnYyLmNvcHkoIHYyICk7XG4gICAgICBfbGluZS56ID0gKCB2MS5wb3NpdGlvblNjcmVlbi56ICsgdjIucG9zaXRpb25TY3JlZW4ueiApIC8gMjtcblxuICAgICAgX2xpbmUubWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cbiAgICAgIF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9saW5lICk7XG5cbiAgICB9O1xuXG4gICAgdmFyIHB1c2hUcmlhbmdsZSA9IGZ1bmN0aW9uICggYSwgYiwgYyApIHtcblxuICAgICAgdmFyIHYxID0gX3ZlcnRleFBvb2xbIGEgXTtcbiAgICAgIHZhciB2MiA9IF92ZXJ0ZXhQb29sWyBiIF07XG4gICAgICB2YXIgdjMgPSBfdmVydGV4UG9vbFsgYyBdO1xuXG4gICAgICBpZiAoIGNoZWNrVHJpYW5nbGVWaXNpYmlsaXR5KCB2MSwgdjIsIHYzICkgPT09IGZhbHNlICkgcmV0dXJuO1xuXG4gICAgICBpZiAoIG1hdGVyaWFsLnNpZGUgPT09IFRIUkVFLkRvdWJsZVNpZGUgfHwgY2hlY2tCYWNrZmFjZUN1bGxpbmcoIHYxLCB2MiwgdjMgKSA9PT0gdHJ1ZSApIHtcblxuICAgICAgICBfZmFjZSA9IGdldE5leHRGYWNlSW5Qb29sKCk7XG5cbiAgICAgICAgX2ZhY2UuaWQgPSBvYmplY3QuaWQ7XG4gICAgICAgIF9mYWNlLnYxLmNvcHkoIHYxICk7XG4gICAgICAgIF9mYWNlLnYyLmNvcHkoIHYyICk7XG4gICAgICAgIF9mYWNlLnYzLmNvcHkoIHYzICk7XG4gICAgICAgIF9mYWNlLnogPSAoIHYxLnBvc2l0aW9uU2NyZWVuLnogKyB2Mi5wb3NpdGlvblNjcmVlbi56ICsgdjMucG9zaXRpb25TY3JlZW4ueiApIC8gMztcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCAzOyBpICsrICkge1xuXG4gICAgICAgICAgdmFyIG9mZnNldCA9IGFyZ3VtZW50c1sgaSBdICogMztcbiAgICAgICAgICB2YXIgbm9ybWFsID0gX2ZhY2UudmVydGV4Tm9ybWFsc01vZGVsWyBpIF07XG5cbiAgICAgICAgICBub3JtYWwuc2V0KCBub3JtYWxzWyBvZmZzZXQgXSwgbm9ybWFsc1sgb2Zmc2V0ICsgMSBdLCBub3JtYWxzWyBvZmZzZXQgKyAyIF0gKTtcbiAgICAgICAgICBub3JtYWwuYXBwbHlNYXRyaXgzKCBub3JtYWxNYXRyaXggKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgIHZhciBvZmZzZXQyID0gYXJndW1lbnRzWyBpIF0gKiAyO1xuXG4gICAgICAgICAgdmFyIHV2ID0gX2ZhY2UudXZzWyBpIF07XG4gICAgICAgICAgdXYuc2V0KCB1dnNbIG9mZnNldDIgXSwgdXZzWyBvZmZzZXQyICsgMSBdICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF9mYWNlLnZlcnRleE5vcm1hbHNMZW5ndGggPSAzO1xuXG4gICAgICAgIF9mYWNlLm1hdGVyaWFsID0gb2JqZWN0Lm1hdGVyaWFsO1xuXG4gICAgICAgIF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9mYWNlICk7XG5cbiAgICAgIH1cblxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2V0T2JqZWN0OiBzZXRPYmplY3QsXG4gICAgICBwcm9qZWN0VmVydGV4OiBwcm9qZWN0VmVydGV4LFxuICAgICAgY2hlY2tUcmlhbmdsZVZpc2liaWxpdHk6IGNoZWNrVHJpYW5nbGVWaXNpYmlsaXR5LFxuICAgICAgY2hlY2tCYWNrZmFjZUN1bGxpbmc6IGNoZWNrQmFja2ZhY2VDdWxsaW5nLFxuICAgICAgcHVzaFZlcnRleDogcHVzaFZlcnRleCxcbiAgICAgIHB1c2hOb3JtYWw6IHB1c2hOb3JtYWwsXG4gICAgICBwdXNoVXY6IHB1c2hVdixcbiAgICAgIHB1c2hMaW5lOiBwdXNoTGluZSxcbiAgICAgIHB1c2hUcmlhbmdsZTogcHVzaFRyaWFuZ2xlXG4gICAgfVxuXG4gIH07XG5cbiAgdmFyIHJlbmRlckxpc3QgPSBuZXcgUmVuZGVyTGlzdCgpO1xuXG4gIHRoaXMucHJvamVjdFNjZW5lID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhLCBzb3J0T2JqZWN0cywgc29ydEVsZW1lbnRzICkge1xuXG4gICAgX2ZhY2VDb3VudCA9IDA7XG4gICAgX2xpbmVDb3VudCA9IDA7XG4gICAgX3Nwcml0ZUNvdW50ID0gMDtcblxuICAgIF9yZW5kZXJEYXRhLmVsZW1lbnRzLmxlbmd0aCA9IDA7XG5cbiAgICBpZiAoIHNjZW5lLmF1dG9VcGRhdGUgPT09IHRydWUgKSBzY2VuZS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuICAgIGlmICggY2FtZXJhLnBhcmVudCA9PT0gdW5kZWZpbmVkICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cbiAgICBfdmlld01hdHJpeC5jb3B5KCBjYW1lcmEubWF0cml4V29ybGRJbnZlcnNlLmdldEludmVyc2UoIGNhbWVyYS5tYXRyaXhXb3JsZCApICk7XG4gICAgX3ZpZXdQcm9qZWN0aW9uTWF0cml4Lm11bHRpcGx5TWF0cmljZXMoIGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4LCBfdmlld01hdHJpeCApO1xuXG4gICAgX2ZydXN0dW0uc2V0RnJvbU1hdHJpeCggX3ZpZXdQcm9qZWN0aW9uTWF0cml4ICk7XG5cbiAgICAvL1xuXG4gICAgX29iamVjdENvdW50ID0gMDtcblxuICAgIF9yZW5kZXJEYXRhLm9iamVjdHMubGVuZ3RoID0gMDtcbiAgICBfcmVuZGVyRGF0YS5saWdodHMubGVuZ3RoID0gMDtcblxuICAgIHNjZW5lLnRyYXZlcnNlVmlzaWJsZSggZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cbiAgICAgIGlmICggb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuTGlnaHQgKSB7XG5cbiAgICAgICAgX3JlbmRlckRhdGEubGlnaHRzLnB1c2goIG9iamVjdCApO1xuXG4gICAgICB9IGVsc2UgaWYgKCBvYmplY3QgaW5zdGFuY2VvZiBUSFJFRS5NZXNoIHx8IG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLkxpbmUgfHwgb2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuU3ByaXRlICkge1xuXG4gICAgICAgIGlmICggb2JqZWN0Lm1hdGVyaWFsLnZpc2libGUgPT09IGZhbHNlICkgcmV0dXJuO1xuXG4gICAgICAgIGlmICggb2JqZWN0LmZydXN0dW1DdWxsZWQgPT09IGZhbHNlIHx8IF9mcnVzdHVtLmludGVyc2VjdHNPYmplY3QoIG9iamVjdCApID09PSB0cnVlICkge1xuXG4gICAgICAgICAgX29iamVjdCA9IGdldE5leHRPYmplY3RJblBvb2woKTtcbiAgICAgICAgICBfb2JqZWN0LmlkID0gb2JqZWN0LmlkO1xuICAgICAgICAgIF9vYmplY3Qub2JqZWN0ID0gb2JqZWN0O1xuXG4gICAgICAgICAgX3ZlY3RvcjMuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBvYmplY3QubWF0cml4V29ybGQgKTtcbiAgICAgICAgICBfdmVjdG9yMy5hcHBseVByb2plY3Rpb24oIF92aWV3UHJvamVjdGlvbk1hdHJpeCApO1xuICAgICAgICAgIF9vYmplY3QueiA9IF92ZWN0b3IzLno7XG5cbiAgICAgICAgICBfcmVuZGVyRGF0YS5vYmplY3RzLnB1c2goIF9vYmplY3QgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH0gKTtcblxuICAgIGlmICggc29ydE9iamVjdHMgPT09IHRydWUgKSB7XG5cbiAgICAgIF9yZW5kZXJEYXRhLm9iamVjdHMuc29ydCggcGFpbnRlclNvcnQgKTtcblxuICAgIH1cblxuICAgIC8vXG5cbiAgICBmb3IgKCB2YXIgbyA9IDAsIG9sID0gX3JlbmRlckRhdGEub2JqZWN0cy5sZW5ndGg7IG8gPCBvbDsgbyArKyApIHtcblxuICAgICAgdmFyIG9iamVjdCA9IF9yZW5kZXJEYXRhLm9iamVjdHNbIG8gXS5vYmplY3Q7XG4gICAgICB2YXIgZ2VvbWV0cnkgPSBvYmplY3QuZ2VvbWV0cnk7XG5cbiAgICAgIHJlbmRlckxpc3Quc2V0T2JqZWN0KCBvYmplY3QgKTtcblxuICAgICAgX21vZGVsTWF0cml4ID0gb2JqZWN0Lm1hdHJpeFdvcmxkO1xuXG4gICAgICBfdmVydGV4Q291bnQgPSAwO1xuXG4gICAgICBpZiAoIG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLk1lc2ggKSB7XG5cbiAgICAgICAgaWYgKCBnZW9tZXRyeSBpbnN0YW5jZW9mIFRIUkVFLkJ1ZmZlckdlb21ldHJ5ICkge1xuXG4gICAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzO1xuICAgICAgICAgIHZhciBvZmZzZXRzID0gZ2VvbWV0cnkub2Zmc2V0cztcblxuICAgICAgICAgIGlmICggYXR0cmlidXRlcy5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkICkgY29udGludWU7XG5cbiAgICAgICAgICB2YXIgcG9zaXRpb25zID0gYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheTtcblxuICAgICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IHBvc2l0aW9ucy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cbiAgICAgICAgICAgIHJlbmRlckxpc3QucHVzaFZlcnRleCggcG9zaXRpb25zWyBpIF0sIHBvc2l0aW9uc1sgaSArIDEgXSwgcG9zaXRpb25zWyBpICsgMiBdICk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGF0dHJpYnV0ZXMubm9ybWFsICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBub3JtYWxzID0gYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IG5vcm1hbHMubGVuZ3RoOyBpIDwgbDsgaSArPSAzICkge1xuXG4gICAgICAgICAgICAgIHJlbmRlckxpc3QucHVzaE5vcm1hbCggbm9ybWFsc1sgaSBdLCBub3JtYWxzWyBpICsgMSBdLCBub3JtYWxzWyBpICsgMiBdICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggYXR0cmlidXRlcy51diAhPT0gdW5kZWZpbmVkICkge1xuXG4gICAgICAgICAgICB2YXIgdXZzID0gYXR0cmlidXRlcy51di5hcnJheTtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsID0gdXZzLmxlbmd0aDsgaSA8IGw7IGkgKz0gMiApIHtcblxuICAgICAgICAgICAgICByZW5kZXJMaXN0LnB1c2hVdiggdXZzWyBpIF0sIHV2c1sgaSArIDEgXSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGF0dHJpYnV0ZXMuaW5kZXggIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICAgICAgdmFyIGluZGljZXMgPSBhdHRyaWJ1dGVzLmluZGV4LmFycmF5O1xuXG4gICAgICAgICAgICBpZiAoIG9mZnNldHMubGVuZ3RoID4gMCApIHtcblxuICAgICAgICAgICAgICBmb3IgKCB2YXIgbyA9IDA7IG8gPCBvZmZzZXRzLmxlbmd0aDsgbyArKyApIHtcblxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBvZmZzZXRzWyBvIF07XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gb2Zmc2V0LmluZGV4O1xuXG4gICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSBvZmZzZXQuc3RhcnQsIGwgPSBvZmZzZXQuc3RhcnQgKyBvZmZzZXQuY291bnQ7IGkgPCBsOyBpICs9IDMgKSB7XG5cbiAgICAgICAgICAgICAgICAgIHJlbmRlckxpc3QucHVzaFRyaWFuZ2xlKCBpbmRpY2VzWyBpIF0gKyBpbmRleCwgaW5kaWNlc1sgaSArIDEgXSArIGluZGV4LCBpbmRpY2VzWyBpICsgMiBdICsgaW5kZXggKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsID0gaW5kaWNlcy5sZW5ndGg7IGkgPCBsOyBpICs9IDMgKSB7XG5cbiAgICAgICAgICAgICAgICByZW5kZXJMaXN0LnB1c2hUcmlhbmdsZSggaW5kaWNlc1sgaSBdLCBpbmRpY2VzWyBpICsgMSBdLCBpbmRpY2VzWyBpICsgMiBdICk7XG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMzsgaSA8IGw7IGkgKz0gMyApIHtcblxuICAgICAgICAgICAgICByZW5kZXJMaXN0LnB1c2hUcmlhbmdsZSggaSwgaSArIDEsIGkgKyAyICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9tZXRyeSBpbnN0YW5jZW9mIFRIUkVFLkdlb21ldHJ5ICkge1xuXG4gICAgICAgICAgdmFyIHZlcnRpY2VzID0gZ2VvbWV0cnkudmVydGljZXM7XG4gICAgICAgICAgdmFyIGZhY2VzID0gZ2VvbWV0cnkuZmFjZXM7XG4gICAgICAgICAgdmFyIGZhY2VWZXJ0ZXhVdnMgPSBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWyAwIF07XG5cbiAgICAgICAgICBfbm9ybWFsTWF0cml4LmdldE5vcm1hbE1hdHJpeCggX21vZGVsTWF0cml4ICk7XG5cbiAgICAgICAgICB2YXIgbWF0ZXJpYWwgPSBvYmplY3QubWF0ZXJpYWw7XG5cbiAgICAgICAgICB2YXIgaXNGYWNlTWF0ZXJpYWwgPSBtYXRlcmlhbCBpbnN0YW5jZW9mIFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWw7XG4gICAgICAgICAgdmFyIG9iamVjdE1hdGVyaWFscyA9IGlzRmFjZU1hdGVyaWFsID09PSB0cnVlID8gb2JqZWN0Lm1hdGVyaWFsIDogbnVsbDtcblxuICAgICAgICAgIGZvciAoIHZhciB2ID0gMCwgdmwgPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bDsgdiArKyApIHtcblxuICAgICAgICAgICAgdmFyIHZlcnRleCA9IHZlcnRpY2VzWyB2IF07XG5cbiAgICAgICAgICAgIF92ZWN0b3IzLmNvcHkoIHZlcnRleCApO1xuXG4gICAgICAgICAgICBpZiAoIG1hdGVyaWFsLm1vcnBoVGFyZ2V0cyA9PT0gdHJ1ZSApIHtcblxuICAgICAgICAgICAgICB2YXIgbW9ycGhUYXJnZXRzID0gZ2VvbWV0cnkubW9ycGhUYXJnZXRzO1xuICAgICAgICAgICAgICB2YXIgbW9ycGhJbmZsdWVuY2VzID0gb2JqZWN0Lm1vcnBoVGFyZ2V0SW5mbHVlbmNlcztcblxuICAgICAgICAgICAgICBmb3IgKCB2YXIgdCA9IDAsIHRsID0gbW9ycGhUYXJnZXRzLmxlbmd0aDsgdCA8IHRsOyB0ICsrICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGluZmx1ZW5jZSA9IG1vcnBoSW5mbHVlbmNlc1sgdCBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBpbmZsdWVuY2UgPT09IDAgKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBtb3JwaFRhcmdldHNbIHQgXTtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0VmVydGV4ID0gdGFyZ2V0LnZlcnRpY2VzWyB2IF07XG5cbiAgICAgICAgICAgICAgICBfdmVjdG9yMy54ICs9ICggdGFyZ2V0VmVydGV4LnggLSB2ZXJ0ZXgueCApICogaW5mbHVlbmNlO1xuICAgICAgICAgICAgICAgIF92ZWN0b3IzLnkgKz0gKCB0YXJnZXRWZXJ0ZXgueSAtIHZlcnRleC55ICkgKiBpbmZsdWVuY2U7XG4gICAgICAgICAgICAgICAgX3ZlY3RvcjMueiArPSAoIHRhcmdldFZlcnRleC56IC0gdmVydGV4LnogKSAqIGluZmx1ZW5jZTtcblxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVuZGVyTGlzdC5wdXNoVmVydGV4KCBfdmVjdG9yMy54LCBfdmVjdG9yMy55LCBfdmVjdG9yMy56ICk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKCB2YXIgZiA9IDAsIGZsID0gZmFjZXMubGVuZ3RoOyBmIDwgZmw7IGYgKysgKSB7XG5cbiAgICAgICAgICAgIHZhciBmYWNlID0gZmFjZXNbIGYgXTtcblxuICAgICAgICAgICAgdmFyIG1hdGVyaWFsID0gaXNGYWNlTWF0ZXJpYWwgPT09IHRydWVcbiAgICAgICAgICAgICAgID8gb2JqZWN0TWF0ZXJpYWxzLm1hdGVyaWFsc1sgZmFjZS5tYXRlcmlhbEluZGV4IF1cbiAgICAgICAgICAgICAgIDogb2JqZWN0Lm1hdGVyaWFsO1xuXG4gICAgICAgICAgICBpZiAoIG1hdGVyaWFsID09PSB1bmRlZmluZWQgKSBjb250aW51ZTtcblxuICAgICAgICAgICAgdmFyIHNpZGUgPSBtYXRlcmlhbC5zaWRlO1xuXG4gICAgICAgICAgICB2YXIgdjEgPSBfdmVydGV4UG9vbFsgZmFjZS5hIF07XG4gICAgICAgICAgICB2YXIgdjIgPSBfdmVydGV4UG9vbFsgZmFjZS5iIF07XG4gICAgICAgICAgICB2YXIgdjMgPSBfdmVydGV4UG9vbFsgZmFjZS5jIF07XG5cbiAgICAgICAgICAgIGlmICggcmVuZGVyTGlzdC5jaGVja1RyaWFuZ2xlVmlzaWJpbGl0eSggdjEsIHYyLCB2MyApID09PSBmYWxzZSApIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB2YXIgdmlzaWJsZSA9IHJlbmRlckxpc3QuY2hlY2tCYWNrZmFjZUN1bGxpbmcoIHYxLCB2MiwgdjMgKTtcblxuICAgICAgICAgICAgaWYgKCBzaWRlICE9PSBUSFJFRS5Eb3VibGVTaWRlICkge1xuICAgICAgICAgICAgICBpZiAoIHNpZGUgPT09IFRIUkVFLkZyb250U2lkZSAmJiB2aXNpYmxlID09PSBmYWxzZSApIGNvbnRpbnVlO1xuICAgICAgICAgICAgICBpZiAoIHNpZGUgPT09IFRIUkVFLkJhY2tTaWRlICYmIHZpc2libGUgPT09IHRydWUgKSBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2ZhY2UgPSBnZXROZXh0RmFjZUluUG9vbCgpO1xuXG4gICAgICAgICAgICBfZmFjZS5pZCA9IG9iamVjdC5pZDtcbiAgICAgICAgICAgIF9mYWNlLnYxLmNvcHkoIHYxICk7XG4gICAgICAgICAgICBfZmFjZS52Mi5jb3B5KCB2MiApO1xuICAgICAgICAgICAgX2ZhY2UudjMuY29weSggdjMgKTtcblxuICAgICAgICAgICAgX2ZhY2Uubm9ybWFsTW9kZWwuY29weSggZmFjZS5ub3JtYWwgKTtcblxuICAgICAgICAgICAgaWYgKCB2aXNpYmxlID09PSBmYWxzZSAmJiAoIHNpZGUgPT09IFRIUkVFLkJhY2tTaWRlIHx8IHNpZGUgPT09IFRIUkVFLkRvdWJsZVNpZGUgKSApIHtcblxuICAgICAgICAgICAgICBfZmFjZS5ub3JtYWxNb2RlbC5uZWdhdGUoKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfZmFjZS5ub3JtYWxNb2RlbC5hcHBseU1hdHJpeDMoIF9ub3JtYWxNYXRyaXggKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgdmFyIGZhY2VWZXJ0ZXhOb3JtYWxzID0gZmFjZS52ZXJ0ZXhOb3JtYWxzO1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgbiA9IDAsIG5sID0gTWF0aC5taW4oIGZhY2VWZXJ0ZXhOb3JtYWxzLmxlbmd0aCwgMyApOyBuIDwgbmw7IG4gKysgKSB7XG5cbiAgICAgICAgICAgICAgdmFyIG5vcm1hbE1vZGVsID0gX2ZhY2UudmVydGV4Tm9ybWFsc01vZGVsWyBuIF07XG4gICAgICAgICAgICAgIG5vcm1hbE1vZGVsLmNvcHkoIGZhY2VWZXJ0ZXhOb3JtYWxzWyBuIF0gKTtcblxuICAgICAgICAgICAgICBpZiAoIHZpc2libGUgPT09IGZhbHNlICYmICggc2lkZSA9PT0gVEhSRUUuQmFja1NpZGUgfHwgc2lkZSA9PT0gVEhSRUUuRG91YmxlU2lkZSApICkge1xuXG4gICAgICAgICAgICAgICAgbm9ybWFsTW9kZWwubmVnYXRlKCk7XG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG5vcm1hbE1vZGVsLmFwcGx5TWF0cml4MyggX25vcm1hbE1hdHJpeCApLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9mYWNlLnZlcnRleE5vcm1hbHNMZW5ndGggPSBmYWNlVmVydGV4Tm9ybWFscy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHZhciB2ZXJ0ZXhVdnMgPSBmYWNlVmVydGV4VXZzWyBmIF07XG5cbiAgICAgICAgICAgIGlmICggdmVydGV4VXZzICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgICAgZm9yICggdmFyIHUgPSAwOyB1IDwgMzsgdSArKyApIHtcblxuICAgICAgICAgICAgICAgIF9mYWNlLnV2c1sgdSBdLmNvcHkoIHZlcnRleFV2c1sgdSBdICk7XG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9mYWNlLmNvbG9yID0gZmFjZS5jb2xvcjtcbiAgICAgICAgICAgIF9mYWNlLm1hdGVyaWFsID0gbWF0ZXJpYWw7XG5cbiAgICAgICAgICAgIF9mYWNlLnogPSAoIHYxLnBvc2l0aW9uU2NyZWVuLnogKyB2Mi5wb3NpdGlvblNjcmVlbi56ICsgdjMucG9zaXRpb25TY3JlZW4ueiApIC8gMztcblxuICAgICAgICAgICAgX3JlbmRlckRhdGEuZWxlbWVudHMucHVzaCggX2ZhY2UgKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoIG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLkxpbmUgKSB7XG5cbiAgICAgICAgaWYgKCBnZW9tZXRyeSBpbnN0YW5jZW9mIFRIUkVFLkJ1ZmZlckdlb21ldHJ5ICkge1xuXG4gICAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzO1xuXG4gICAgICAgICAgaWYgKCBhdHRyaWJ1dGVzLnBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbnMgPSBhdHRyaWJ1dGVzLnBvc2l0aW9uLmFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBwb3NpdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSArPSAzICkge1xuXG4gICAgICAgICAgICAgIHJlbmRlckxpc3QucHVzaFZlcnRleCggcG9zaXRpb25zWyBpIF0sIHBvc2l0aW9uc1sgaSArIDEgXSwgcG9zaXRpb25zWyBpICsgMiBdICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBhdHRyaWJ1dGVzLmluZGV4ICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGluZGljZXMgPSBhdHRyaWJ1dGVzLmluZGV4LmFycmF5O1xuXG4gICAgICAgICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IGluZGljZXMubGVuZ3RoOyBpIDwgbDsgaSArPSAyICkge1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyTGlzdC5wdXNoTGluZSggaW5kaWNlc1sgaSBdLCBpbmRpY2VzWyBpICsgMSBdICk7XG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgIHZhciBzdGVwID0gb2JqZWN0Lm1vZGUgPT09IFRIUkVFLkxpbmVQaWVjZXMgPyAyIDogMTtcblxuICAgICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSAoIHBvc2l0aW9ucy5sZW5ndGggLyAzICkgLSAxOyBpIDwgbDsgaSArPSBzdGVwICkge1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyTGlzdC5wdXNoTGluZSggaSwgaSArIDEgKTtcblxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9tZXRyeSBpbnN0YW5jZW9mIFRIUkVFLkdlb21ldHJ5ICkge1xuXG4gICAgICAgICAgX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXgubXVsdGlwbHlNYXRyaWNlcyggX3ZpZXdQcm9qZWN0aW9uTWF0cml4LCBfbW9kZWxNYXRyaXggKTtcblxuICAgICAgICAgIHZhciB2ZXJ0aWNlcyA9IG9iamVjdC5nZW9tZXRyeS52ZXJ0aWNlcztcblxuICAgICAgICAgIGlmICggdmVydGljZXMubGVuZ3RoID09PSAwICkgY29udGludWU7XG5cbiAgICAgICAgICB2MSA9IGdldE5leHRWZXJ0ZXhJblBvb2woKTtcbiAgICAgICAgICB2MS5wb3NpdGlvblNjcmVlbi5jb3B5KCB2ZXJ0aWNlc1sgMCBdICkuYXBwbHlNYXRyaXg0KCBfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG4gICAgICAgICAgLy8gSGFuZGxlIExpbmVTdHJpcCBhbmQgTGluZVBpZWNlc1xuICAgICAgICAgIHZhciBzdGVwID0gb2JqZWN0Lm1vZGUgPT09IFRIUkVFLkxpbmVQaWVjZXMgPyAyIDogMTtcblxuICAgICAgICAgIGZvciAoIHZhciB2ID0gMSwgdmwgPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bDsgdiArKyApIHtcblxuICAgICAgICAgICAgdjEgPSBnZXROZXh0VmVydGV4SW5Qb29sKCk7XG4gICAgICAgICAgICB2MS5wb3NpdGlvblNjcmVlbi5jb3B5KCB2ZXJ0aWNlc1sgdiBdICkuYXBwbHlNYXRyaXg0KCBfbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCApO1xuXG4gICAgICAgICAgICBpZiAoICggdiArIDEgKSAlIHN0ZXAgPiAwICkgY29udGludWU7XG5cbiAgICAgICAgICAgIHYyID0gX3ZlcnRleFBvb2xbIF92ZXJ0ZXhDb3VudCAtIDIgXTtcblxuICAgICAgICAgICAgX2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4uY29weSggdjEucG9zaXRpb25TY3JlZW4gKTtcbiAgICAgICAgICAgIF9jbGlwcGVkVmVydGV4MlBvc2l0aW9uU2NyZWVuLmNvcHkoIHYyLnBvc2l0aW9uU2NyZWVuICk7XG5cbiAgICAgICAgICAgIGlmICggY2xpcExpbmUoIF9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuLCBfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbiApID09PSB0cnVlICkge1xuXG4gICAgICAgICAgICAgIC8vIFBlcmZvcm0gdGhlIHBlcnNwZWN0aXZlIGRpdmlkZVxuICAgICAgICAgICAgICBfY2xpcHBlZFZlcnRleDFQb3NpdGlvblNjcmVlbi5tdWx0aXBseVNjYWxhciggMSAvIF9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuLncgKTtcbiAgICAgICAgICAgICAgX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4ubXVsdGlwbHlTY2FsYXIoIDEgLyBfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbi53ICk7XG5cbiAgICAgICAgICAgICAgX2xpbmUgPSBnZXROZXh0TGluZUluUG9vbCgpO1xuXG4gICAgICAgICAgICAgIF9saW5lLmlkID0gb2JqZWN0LmlkO1xuICAgICAgICAgICAgICBfbGluZS52MS5wb3NpdGlvblNjcmVlbi5jb3B5KCBfY2xpcHBlZFZlcnRleDFQb3NpdGlvblNjcmVlbiApO1xuICAgICAgICAgICAgICBfbGluZS52Mi5wb3NpdGlvblNjcmVlbi5jb3B5KCBfY2xpcHBlZFZlcnRleDJQb3NpdGlvblNjcmVlbiApO1xuXG4gICAgICAgICAgICAgIF9saW5lLnogPSBNYXRoLm1heCggX2NsaXBwZWRWZXJ0ZXgxUG9zaXRpb25TY3JlZW4ueiwgX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4ueiApO1xuXG4gICAgICAgICAgICAgIF9saW5lLm1hdGVyaWFsID0gb2JqZWN0Lm1hdGVyaWFsO1xuXG4gICAgICAgICAgICAgIGlmICggb2JqZWN0Lm1hdGVyaWFsLnZlcnRleENvbG9ycyA9PT0gVEhSRUUuVmVydGV4Q29sb3JzICkge1xuXG4gICAgICAgICAgICAgICAgX2xpbmUudmVydGV4Q29sb3JzWyAwIF0uY29weSggb2JqZWN0Lmdlb21ldHJ5LmNvbG9yc1sgdiBdICk7XG4gICAgICAgICAgICAgICAgX2xpbmUudmVydGV4Q29sb3JzWyAxIF0uY29weSggb2JqZWN0Lmdlb21ldHJ5LmNvbG9yc1sgdiAtIDEgXSApO1xuXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBfcmVuZGVyRGF0YS5lbGVtZW50cy5wdXNoKCBfbGluZSApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKCBvYmplY3QgaW5zdGFuY2VvZiBUSFJFRS5TcHJpdGUgKSB7XG5cbiAgICAgICAgX3ZlY3RvcjQuc2V0KCBfbW9kZWxNYXRyaXguZWxlbWVudHNbIDEyIF0sIF9tb2RlbE1hdHJpeC5lbGVtZW50c1sgMTMgXSwgX21vZGVsTWF0cml4LmVsZW1lbnRzWyAxNCBdLCAxICk7XG4gICAgICAgIF92ZWN0b3I0LmFwcGx5TWF0cml4NCggX3ZpZXdQcm9qZWN0aW9uTWF0cml4ICk7XG5cbiAgICAgICAgdmFyIGludlcgPSAxIC8gX3ZlY3RvcjQudztcblxuICAgICAgICBfdmVjdG9yNC56ICo9IGludlc7XG5cbiAgICAgICAgaWYgKCBfdmVjdG9yNC56ID49IC0gMSAmJiBfdmVjdG9yNC56IDw9IDEgKSB7XG5cbiAgICAgICAgICBfc3ByaXRlID0gZ2V0TmV4dFNwcml0ZUluUG9vbCgpO1xuICAgICAgICAgIF9zcHJpdGUuaWQgPSBvYmplY3QuaWQ7XG4gICAgICAgICAgX3Nwcml0ZS54ID0gX3ZlY3RvcjQueCAqIGludlc7XG4gICAgICAgICAgX3Nwcml0ZS55ID0gX3ZlY3RvcjQueSAqIGludlc7XG4gICAgICAgICAgX3Nwcml0ZS56ID0gX3ZlY3RvcjQuejtcbiAgICAgICAgICBfc3ByaXRlLm9iamVjdCA9IG9iamVjdDtcblxuICAgICAgICAgIF9zcHJpdGUucm90YXRpb24gPSBvYmplY3Qucm90YXRpb247XG5cbiAgICAgICAgICBfc3ByaXRlLnNjYWxlLnggPSBvYmplY3Quc2NhbGUueCAqIE1hdGguYWJzKCBfc3ByaXRlLnggLSAoIF92ZWN0b3I0LnggKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMCBdICkgLyAoIF92ZWN0b3I0LncgKyBjYW1lcmEucHJvamVjdGlvbk1hdHJpeC5lbGVtZW50c1sgMTIgXSApICk7XG4gICAgICAgICAgX3Nwcml0ZS5zY2FsZS55ID0gb2JqZWN0LnNjYWxlLnkgKiBNYXRoLmFicyggX3Nwcml0ZS55IC0gKCBfdmVjdG9yNC55ICsgY2FtZXJhLnByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDUgXSApIC8gKCBfdmVjdG9yNC53ICsgY2FtZXJhLnByb2plY3Rpb25NYXRyaXguZWxlbWVudHNbIDEzIF0gKSApO1xuXG4gICAgICAgICAgX3Nwcml0ZS5tYXRlcmlhbCA9IG9iamVjdC5tYXRlcmlhbDtcblxuICAgICAgICAgIF9yZW5kZXJEYXRhLmVsZW1lbnRzLnB1c2goIF9zcHJpdGUgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH1cblxuICAgIGlmICggc29ydEVsZW1lbnRzID09PSB0cnVlICkge1xuXG4gICAgICBfcmVuZGVyRGF0YS5lbGVtZW50cy5zb3J0KCBwYWludGVyU29ydCApO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZW5kZXJEYXRhO1xuXG4gIH07XG5cbiAgLy8gUG9vbHNcblxuICBmdW5jdGlvbiBnZXROZXh0T2JqZWN0SW5Qb29sKCkge1xuXG4gICAgaWYgKCBfb2JqZWN0Q291bnQgPT09IF9vYmplY3RQb29sTGVuZ3RoICkge1xuXG4gICAgICB2YXIgb2JqZWN0ID0gbmV3IFRIUkVFLlJlbmRlcmFibGVPYmplY3QoKTtcbiAgICAgIF9vYmplY3RQb29sLnB1c2goIG9iamVjdCApO1xuICAgICAgX29iamVjdFBvb2xMZW5ndGggKys7XG4gICAgICBfb2JqZWN0Q291bnQgKys7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIF9vYmplY3RQb29sWyBfb2JqZWN0Q291bnQgKysgXTtcblxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TmV4dFZlcnRleEluUG9vbCgpIHtcblxuICAgIGlmICggX3ZlcnRleENvdW50ID09PSBfdmVydGV4UG9vbExlbmd0aCApIHtcblxuICAgICAgdmFyIHZlcnRleCA9IG5ldyBUSFJFRS5SZW5kZXJhYmxlVmVydGV4KCk7XG4gICAgICBfdmVydGV4UG9vbC5wdXNoKCB2ZXJ0ZXggKTtcbiAgICAgIF92ZXJ0ZXhQb29sTGVuZ3RoICsrO1xuICAgICAgX3ZlcnRleENvdW50ICsrO1xuICAgICAgcmV0dXJuIHZlcnRleDtcblxuICAgIH1cblxuICAgIHJldHVybiBfdmVydGV4UG9vbFsgX3ZlcnRleENvdW50ICsrIF07XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5leHRGYWNlSW5Qb29sKCkge1xuXG4gICAgaWYgKCBfZmFjZUNvdW50ID09PSBfZmFjZVBvb2xMZW5ndGggKSB7XG5cbiAgICAgIHZhciBmYWNlID0gbmV3IFRIUkVFLlJlbmRlcmFibGVGYWNlKCk7XG4gICAgICBfZmFjZVBvb2wucHVzaCggZmFjZSApO1xuICAgICAgX2ZhY2VQb29sTGVuZ3RoICsrO1xuICAgICAgX2ZhY2VDb3VudCArKztcbiAgICAgIHJldHVybiBmYWNlO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIF9mYWNlUG9vbFsgX2ZhY2VDb3VudCArKyBdO1xuXG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5leHRMaW5lSW5Qb29sKCkge1xuXG4gICAgaWYgKCBfbGluZUNvdW50ID09PSBfbGluZVBvb2xMZW5ndGggKSB7XG5cbiAgICAgIHZhciBsaW5lID0gbmV3IFRIUkVFLlJlbmRlcmFibGVMaW5lKCk7XG4gICAgICBfbGluZVBvb2wucHVzaCggbGluZSApO1xuICAgICAgX2xpbmVQb29sTGVuZ3RoICsrO1xuICAgICAgX2xpbmVDb3VudCArK1xuICAgICAgcmV0dXJuIGxpbmU7XG5cbiAgICB9XG5cbiAgICByZXR1cm4gX2xpbmVQb29sWyBfbGluZUNvdW50ICsrIF07XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5leHRTcHJpdGVJblBvb2woKSB7XG5cbiAgICBpZiAoIF9zcHJpdGVDb3VudCA9PT0gX3Nwcml0ZVBvb2xMZW5ndGggKSB7XG5cbiAgICAgIHZhciBzcHJpdGUgPSBuZXcgVEhSRUUuUmVuZGVyYWJsZVNwcml0ZSgpO1xuICAgICAgX3Nwcml0ZVBvb2wucHVzaCggc3ByaXRlICk7XG4gICAgICBfc3ByaXRlUG9vbExlbmd0aCArKztcbiAgICAgIF9zcHJpdGVDb3VudCArK1xuICAgICAgcmV0dXJuIHNwcml0ZTtcblxuICAgIH1cblxuICAgIHJldHVybiBfc3ByaXRlUG9vbFsgX3Nwcml0ZUNvdW50ICsrIF07XG5cbiAgfVxuXG4gIC8vXG5cbiAgZnVuY3Rpb24gcGFpbnRlclNvcnQoIGEsIGIgKSB7XG5cbiAgICBpZiAoIGEueiAhPT0gYi56ICkge1xuXG4gICAgICByZXR1cm4gYi56IC0gYS56O1xuXG4gICAgfSBlbHNlIGlmICggYS5pZCAhPT0gYi5pZCApIHtcblxuICAgICAgcmV0dXJuIGEuaWQgLSBiLmlkO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgcmV0dXJuIDA7XG5cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsaXBMaW5lKCBzMSwgczIgKSB7XG5cbiAgICB2YXIgYWxwaGExID0gMCwgYWxwaGEyID0gMSxcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgYm91bmRhcnkgY29vcmRpbmF0ZSBvZiBlYWNoIHZlcnRleCBmb3IgdGhlIG5lYXIgYW5kIGZhciBjbGlwIHBsYW5lcyxcbiAgICAvLyBaID0gLTEgYW5kIFogPSArMSwgcmVzcGVjdGl2ZWx5LlxuICAgIGJjMW5lYXIgPSAgczEueiArIHMxLncsXG4gICAgYmMybmVhciA9ICBzMi56ICsgczIudyxcbiAgICBiYzFmYXIgPSAgLSBzMS56ICsgczEudyxcbiAgICBiYzJmYXIgPSAgLSBzMi56ICsgczIudztcblxuICAgIGlmICggYmMxbmVhciA+PSAwICYmIGJjMm5lYXIgPj0gMCAmJiBiYzFmYXIgPj0gMCAmJiBiYzJmYXIgPj0gMCApIHtcblxuICAgICAgLy8gQm90aCB2ZXJ0aWNlcyBsaWUgZW50aXJlbHkgd2l0aGluIGFsbCBjbGlwIHBsYW5lcy5cbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfSBlbHNlIGlmICggKCBiYzFuZWFyIDwgMCAmJiBiYzJuZWFyIDwgMCApIHx8ICggYmMxZmFyIDwgMCAmJiBiYzJmYXIgPCAwICkgKSB7XG5cbiAgICAgIC8vIEJvdGggdmVydGljZXMgbGllIGVudGlyZWx5IG91dHNpZGUgb25lIG9mIHRoZSBjbGlwIHBsYW5lcy5cbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIFRoZSBsaW5lIHNlZ21lbnQgc3BhbnMgYXQgbGVhc3Qgb25lIGNsaXAgcGxhbmUuXG5cbiAgICAgIGlmICggYmMxbmVhciA8IDAgKSB7XG5cbiAgICAgICAgLy8gdjEgbGllcyBvdXRzaWRlIHRoZSBuZWFyIHBsYW5lLCB2MiBpbnNpZGVcbiAgICAgICAgYWxwaGExID0gTWF0aC5tYXgoIGFscGhhMSwgYmMxbmVhciAvICggYmMxbmVhciAtIGJjMm5lYXIgKSApO1xuXG4gICAgICB9IGVsc2UgaWYgKCBiYzJuZWFyIDwgMCApIHtcblxuICAgICAgICAvLyB2MiBsaWVzIG91dHNpZGUgdGhlIG5lYXIgcGxhbmUsIHYxIGluc2lkZVxuICAgICAgICBhbHBoYTIgPSBNYXRoLm1pbiggYWxwaGEyLCBiYzFuZWFyIC8gKCBiYzFuZWFyIC0gYmMybmVhciApICk7XG5cbiAgICAgIH1cblxuICAgICAgaWYgKCBiYzFmYXIgPCAwICkge1xuXG4gICAgICAgIC8vIHYxIGxpZXMgb3V0c2lkZSB0aGUgZmFyIHBsYW5lLCB2MiBpbnNpZGVcbiAgICAgICAgYWxwaGExID0gTWF0aC5tYXgoIGFscGhhMSwgYmMxZmFyIC8gKCBiYzFmYXIgLSBiYzJmYXIgKSApO1xuXG4gICAgICB9IGVsc2UgaWYgKCBiYzJmYXIgPCAwICkge1xuXG4gICAgICAgIC8vIHYyIGxpZXMgb3V0c2lkZSB0aGUgZmFyIHBsYW5lLCB2MiBpbnNpZGVcbiAgICAgICAgYWxwaGEyID0gTWF0aC5taW4oIGFscGhhMiwgYmMxZmFyIC8gKCBiYzFmYXIgLSBiYzJmYXIgKSApO1xuXG4gICAgICB9XG5cbiAgICAgIGlmICggYWxwaGEyIDwgYWxwaGExICkge1xuXG4gICAgICAgIC8vIFRoZSBsaW5lIHNlZ21lbnQgc3BhbnMgdHdvIGJvdW5kYXJpZXMsIGJ1dCBpcyBvdXRzaWRlIGJvdGggb2YgdGhlbS5cbiAgICAgICAgLy8gKFRoaXMgY2FuJ3QgaGFwcGVuIHdoZW4gd2UncmUgb25seSBjbGlwcGluZyBhZ2FpbnN0IGp1c3QgbmVhci9mYXIgYnV0IGdvb2RcbiAgICAgICAgLy8gIHRvIGxlYXZlIHRoZSBjaGVjayBoZXJlIGZvciBmdXR1cmUgdXNhZ2UgaWYgb3RoZXIgY2xpcCBwbGFuZXMgYXJlIGFkZGVkLilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgczEgYW5kIHMyIHZlcnRpY2VzIHRvIG1hdGNoIHRoZSBjbGlwcGVkIGxpbmUgc2VnbWVudC5cbiAgICAgICAgczEubGVycCggczIsIGFscGhhMSApO1xuICAgICAgICBzMi5sZXJwKCBzMSwgMSAtIGFscGhhMiApO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfVxuXG59OyJdLCJuYW1lcyI6WyJUSFJFRSIsIlJlbmRlcmFibGVPYmplY3QiLCJpZCIsIm9iamVjdCIsInoiLCJSZW5kZXJhYmxlRmFjZSIsInYxIiwiUmVuZGVyYWJsZVZlcnRleCIsInYyIiwidjMiLCJub3JtYWxNb2RlbCIsIlZlY3RvcjMiLCJ2ZXJ0ZXhOb3JtYWxzTW9kZWwiLCJ2ZXJ0ZXhOb3JtYWxzTGVuZ3RoIiwiY29sb3IiLCJDb2xvciIsIm1hdGVyaWFsIiwidXZzIiwiVmVjdG9yMiIsInBvc2l0aW9uIiwicG9zaXRpb25Xb3JsZCIsInBvc2l0aW9uU2NyZWVuIiwiVmVjdG9yNCIsInZpc2libGUiLCJwcm90b3R5cGUiLCJjb3B5IiwidmVydGV4IiwiUmVuZGVyYWJsZUxpbmUiLCJ2ZXJ0ZXhDb2xvcnMiLCJSZW5kZXJhYmxlU3ByaXRlIiwieCIsInkiLCJyb3RhdGlvbiIsInNjYWxlIiwiUHJvamVjdG9yIiwiX29iamVjdCIsIl9vYmplY3RDb3VudCIsIl9vYmplY3RQb29sIiwiX29iamVjdFBvb2xMZW5ndGgiLCJfdmVydGV4IiwiX3ZlcnRleENvdW50IiwiX3ZlcnRleFBvb2wiLCJfdmVydGV4UG9vbExlbmd0aCIsIl9mYWNlIiwiX2ZhY2VDb3VudCIsIl9mYWNlUG9vbCIsIl9mYWNlUG9vbExlbmd0aCIsIl9saW5lIiwiX2xpbmVDb3VudCIsIl9saW5lUG9vbCIsIl9saW5lUG9vbExlbmd0aCIsIl9zcHJpdGUiLCJfc3ByaXRlQ291bnQiLCJfc3ByaXRlUG9vbCIsIl9zcHJpdGVQb29sTGVuZ3RoIiwiX3JlbmRlckRhdGEiLCJvYmplY3RzIiwibGlnaHRzIiwiZWxlbWVudHMiLCJfdmVjdG9yMyIsIl92ZWN0b3I0IiwiX2NsaXBCb3giLCJCb3gzIiwiX2JvdW5kaW5nQm94IiwiX3BvaW50czMiLCJBcnJheSIsIl9wb2ludHM0IiwiX3ZpZXdNYXRyaXgiLCJNYXRyaXg0IiwiX3ZpZXdQcm9qZWN0aW9uTWF0cml4IiwiX21vZGVsTWF0cml4IiwiX21vZGVsVmlld1Byb2plY3Rpb25NYXRyaXgiLCJfbm9ybWFsTWF0cml4IiwiTWF0cml4MyIsIl9mcnVzdHVtIiwiRnJ1c3R1bSIsIl9jbGlwcGVkVmVydGV4MVBvc2l0aW9uU2NyZWVuIiwiX2NsaXBwZWRWZXJ0ZXgyUG9zaXRpb25TY3JlZW4iLCJwcm9qZWN0VmVjdG9yIiwidmVjdG9yIiwiY2FtZXJhIiwiY29uc29sZSIsIndhcm4iLCJwcm9qZWN0IiwidW5wcm9qZWN0VmVjdG9yIiwidW5wcm9qZWN0IiwicGlja2luZ1JheSIsImVycm9yIiwiUmVuZGVyTGlzdCIsIm5vcm1hbHMiLCJub3JtYWxNYXRyaXgiLCJzZXRPYmplY3QiLCJ2YWx1ZSIsImdldE5vcm1hbE1hdHJpeCIsIm1hdHJpeFdvcmxkIiwibGVuZ3RoIiwicHJvamVjdFZlcnRleCIsImFwcGx5TWF0cml4NCIsImludlciLCJ3IiwicHVzaFZlcnRleCIsImdldE5leHRWZXJ0ZXhJblBvb2wiLCJzZXQiLCJwdXNoTm9ybWFsIiwicHVzaCIsInB1c2hVdiIsImNoZWNrVHJpYW5nbGVWaXNpYmlsaXR5IiwiaXNJbnRlcnNlY3Rpb25Cb3giLCJzZXRGcm9tUG9pbnRzIiwiY2hlY2tCYWNrZmFjZUN1bGxpbmciLCJwdXNoTGluZSIsImEiLCJiIiwiZ2V0TmV4dExpbmVJblBvb2wiLCJwdXNoVHJpYW5nbGUiLCJjIiwic2lkZSIsIkRvdWJsZVNpZGUiLCJnZXROZXh0RmFjZUluUG9vbCIsImkiLCJvZmZzZXQiLCJhcmd1bWVudHMiLCJub3JtYWwiLCJhcHBseU1hdHJpeDMiLCJub3JtYWxpemUiLCJvZmZzZXQyIiwidXYiLCJyZW5kZXJMaXN0IiwicHJvamVjdFNjZW5lIiwic2NlbmUiLCJzb3J0T2JqZWN0cyIsInNvcnRFbGVtZW50cyIsImF1dG9VcGRhdGUiLCJ1cGRhdGVNYXRyaXhXb3JsZCIsInBhcmVudCIsInVuZGVmaW5lZCIsIm1hdHJpeFdvcmxkSW52ZXJzZSIsImdldEludmVyc2UiLCJtdWx0aXBseU1hdHJpY2VzIiwicHJvamVjdGlvbk1hdHJpeCIsInNldEZyb21NYXRyaXgiLCJ0cmF2ZXJzZVZpc2libGUiLCJMaWdodCIsIk1lc2giLCJMaW5lIiwiU3ByaXRlIiwiZnJ1c3R1bUN1bGxlZCIsImludGVyc2VjdHNPYmplY3QiLCJnZXROZXh0T2JqZWN0SW5Qb29sIiwic2V0RnJvbU1hdHJpeFBvc2l0aW9uIiwiYXBwbHlQcm9qZWN0aW9uIiwic29ydCIsInBhaW50ZXJTb3J0IiwibyIsIm9sIiwiZ2VvbWV0cnkiLCJCdWZmZXJHZW9tZXRyeSIsImF0dHJpYnV0ZXMiLCJvZmZzZXRzIiwicG9zaXRpb25zIiwiYXJyYXkiLCJsIiwiaW5kZXgiLCJpbmRpY2VzIiwic3RhcnQiLCJjb3VudCIsIkdlb21ldHJ5IiwidmVydGljZXMiLCJmYWNlcyIsImZhY2VWZXJ0ZXhVdnMiLCJpc0ZhY2VNYXRlcmlhbCIsIk1lc2hGYWNlTWF0ZXJpYWwiLCJvYmplY3RNYXRlcmlhbHMiLCJ2IiwidmwiLCJtb3JwaFRhcmdldHMiLCJtb3JwaEluZmx1ZW5jZXMiLCJtb3JwaFRhcmdldEluZmx1ZW5jZXMiLCJ0IiwidGwiLCJpbmZsdWVuY2UiLCJ0YXJnZXQiLCJ0YXJnZXRWZXJ0ZXgiLCJmIiwiZmwiLCJmYWNlIiwibWF0ZXJpYWxzIiwibWF0ZXJpYWxJbmRleCIsIkZyb250U2lkZSIsIkJhY2tTaWRlIiwibmVnYXRlIiwiZmFjZVZlcnRleE5vcm1hbHMiLCJ2ZXJ0ZXhOb3JtYWxzIiwibiIsIm5sIiwiTWF0aCIsIm1pbiIsInZlcnRleFV2cyIsInUiLCJzdGVwIiwibW9kZSIsIkxpbmVQaWVjZXMiLCJjbGlwTGluZSIsIm11bHRpcGx5U2NhbGFyIiwibWF4IiwiVmVydGV4Q29sb3JzIiwiY29sb3JzIiwiZ2V0TmV4dFNwcml0ZUluUG9vbCIsImFicyIsImxpbmUiLCJzcHJpdGUiLCJzMSIsInMyIiwiYWxwaGExIiwiYWxwaGEyIiwiYmMxbmVhciIsImJjMm5lYXIiLCJiYzFmYXIiLCJiYzJmYXIiLCJsZXJwIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztDQUlDLEdBRURBLE1BQU1DLGdCQUFnQixHQUFHO0lBRXZCLElBQUksQ0FBQ0MsRUFBRSxHQUFHO0lBRVYsSUFBSSxDQUFDQyxNQUFNLEdB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