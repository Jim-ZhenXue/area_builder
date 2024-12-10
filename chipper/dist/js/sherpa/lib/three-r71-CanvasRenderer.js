/**
 * @author mrdoob / http://mrdoob.com/
 */ THREE.SpriteCanvasMaterial = function(parameters) {
    THREE.Material.call(this);
    this.type = 'SpriteCanvasMaterial';
    this.color = new THREE.Color(0xffffff);
    this.program = function(context, color) {};
    this.setValues(parameters);
};
THREE.SpriteCanvasMaterial.prototype = Object.create(THREE.Material.prototype);
THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;
THREE.SpriteCanvasMaterial.prototype.clone = function() {
    var material = new THREE.SpriteCanvasMaterial();
    THREE.Material.prototype.clone.call(this, material);
    material.color.copy(this.color);
    material.program = this.program;
    return material;
};
//
THREE.CanvasRenderer = function(parameters) {
    console.log('THREE.CanvasRenderer', THREE.REVISION);
    var smoothstep = THREE.Math.smoothstep;
    parameters = parameters || {};
    var _this = this, _renderData, _elements, _lights, _projector = new THREE.Projector(), _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas'), _canvasWidth = _canvas.width, _canvasHeight = _canvas.height, _canvasWidthHalf = Math.floor(_canvasWidth / 2), _canvasHeightHalf = Math.floor(_canvasHeight / 2), _viewportX = 0, _viewportY = 0, _viewportWidth = _canvasWidth, _viewportHeight = _canvasHeight, pixelRatio = 1, _context = _canvas.getContext('2d', {
        alpha: parameters.alpha === true
    }), _clearColor = new THREE.Color(0x000000), _clearAlpha = parameters.alpha === true ? 0 : 1, _contextGlobalAlpha = 1, _contextGlobalCompositeOperation = 0, _contextStrokeStyle = null, _contextFillStyle = null, _contextLineWidth = null, _contextLineCap = null, _contextLineJoin = null, _contextLineDash = [], _camera, _v1, _v2, _v3, _v4, _v5 = new THREE.RenderableVertex(), _v6 = new THREE.RenderableVertex(), _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _v4x, _v4y, _v5x, _v5y, _v6x, _v6y, _color = new THREE.Color(), _color1 = new THREE.Color(), _color2 = new THREE.Color(), _color3 = new THREE.Color(), _color4 = new THREE.Color(), _diffuseColor = new THREE.Color(), _emissiveColor = new THREE.Color(), _lightColor = new THREE.Color(), _patterns = {}, _image, _uvs, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, _clipBox = new THREE.Box2(), _clearBox = new THREE.Box2(), _elemBox = new THREE.Box2(), _ambientLight = new THREE.Color(), _directionalLights = new THREE.Color(), _pointLights = new THREE.Color(), _vector3 = new THREE.Vector3(), _centroid = new THREE.Vector3(), _normal = new THREE.Vector3(), _normalViewMatrix = new THREE.Matrix3();
    // dash+gap fallbacks for Firefox and everything else
    if (_context.setLineDash === undefined) {
        _context.setLineDash = function() {};
    }
    this.domElement = _canvas;
    this.autoClear = true;
    this.sortObjects = true;
    this.sortElements = true;
    this.info = {
        render: {
            vertices: 0,
            faces: 0
        }
    };
    // WebGLRenderer compatibility
    this.supportsVertexTextures = function() {};
    this.setFaceCulling = function() {};
    //
    this.getPixelRatio = function() {
        return pixelRatio;
    };
    this.setPixelRatio = function(value) {
        pixelRatio = value;
    };
    this.setSize = function(width, height, updateStyle) {
        _canvasWidth = width * pixelRatio;
        _canvasHeight = height * pixelRatio;
        _canvas.width = _canvasWidth;
        _canvas.height = _canvasHeight;
        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
        _canvasHeightHalf = Math.floor(_canvasHeight / 2);
        if (updateStyle !== false) {
            _canvas.style.width = width + 'px';
            _canvas.style.height = height + 'px';
        }
        _clipBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf), _clipBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
        _contextGlobalAlpha = 1;
        _contextGlobalCompositeOperation = 0;
        _contextStrokeStyle = null;
        _contextFillStyle = null;
        _contextLineWidth = null;
        _contextLineCap = null;
        _contextLineJoin = null;
        this.setViewport(0, 0, width, height);
    };
    this.setViewport = function(x, y, width, height) {
        _viewportX = x * pixelRatio;
        _viewportY = y * pixelRatio;
        _viewportWidth = width * pixelRatio;
        _viewportHeight = height * pixelRatio;
    };
    this.setScissor = function() {};
    this.enableScissorTest = function() {};
    this.setClearColor = function(color, alpha) {
        _clearColor.set(color);
        _clearAlpha = alpha !== undefined ? alpha : 1;
        _clearBox.min.set(-_canvasWidthHalf, -_canvasHeightHalf);
        _clearBox.max.set(_canvasWidthHalf, _canvasHeightHalf);
    };
    this.setClearColorHex = function(hex, alpha) {
        console.warn('THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.');
        this.setClearColor(hex, alpha);
    };
    this.getClearColor = function() {
        return _clearColor;
    };
    this.getClearAlpha = function() {
        return _clearAlpha;
    };
    this.getMaxAnisotropy = function() {
        return 0;
    };
    this.clear = function() {
        if (_clearBox.empty() === false) {
            _clearBox.intersect(_clipBox);
            _clearBox.expandByScalar(2);
            _clearBox.min.x = _clearBox.min.x + _canvasWidthHalf;
            _clearBox.min.y = -_clearBox.min.y + _canvasHeightHalf; // higher y value !
            _clearBox.max.x = _clearBox.max.x + _canvasWidthHalf;
            _clearBox.max.y = -_clearBox.max.y + _canvasHeightHalf; // lower y value !
            if (_clearAlpha < 1) {
                _context.clearRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
            }
            if (_clearAlpha > 0) {
                setBlending(THREE.NormalBlending);
                setOpacity(1);
                setFillStyle('rgba(' + Math.floor(_clearColor.r * 255) + ',' + Math.floor(_clearColor.g * 255) + ',' + Math.floor(_clearColor.b * 255) + ',' + _clearAlpha + ')');
                _context.fillRect(_clearBox.min.x | 0, _clearBox.max.y | 0, _clearBox.max.x - _clearBox.min.x | 0, _clearBox.min.y - _clearBox.max.y | 0);
            }
            _clearBox.makeEmpty();
        }
    };
    // compatibility
    this.clearColor = function() {};
    this.clearDepth = function() {};
    this.clearStencil = function() {};
    this.render = function(scene, camera) {
        if (camera instanceof THREE.Camera === false) {
            console.error('THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.');
            return;
        }
        if (this.autoClear === true) this.clear();
        _this.info.render.vertices = 0;
        _this.info.render.faces = 0;
        _context.setTransform(_viewportWidth / _canvasWidth, 0, 0, -_viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY);
        _context.translate(_canvasWidthHalf, _canvasHeightHalf);
        _renderData = _projector.projectScene(scene, camera, this.sortObjects, this.sortElements);
        _elements = _renderData.elements;
        _lights = _renderData.lights;
        _camera = camera;
        _normalViewMatrix.getNormalMatrix(camera.matrixWorldInverse);
        /* DEBUG
    setFillStyle( 'rgba( 0, 255, 255, 0.5 )' );
    _context.fillRect( _clipBox.min.x, _clipBox.min.y, _clipBox.max.x - _clipBox.min.x, _clipBox.max.y - _clipBox.min.y );
    */ calculateLights();
        for(var e = 0, el = _elements.length; e < el; e++){
            var element = _elements[e];
            var material = element.material;
            if (material === undefined || material.opacity === 0) continue;
            _elemBox.makeEmpty();
            if (element instanceof THREE.RenderableSprite) {
                _v1 = element;
                _v1.x *= _canvasWidthHalf;
                _v1.y *= _canvasHeightHalf;
                renderSprite(_v1, element, material);
            } else if (element instanceof THREE.RenderableLine) {
                _v1 = element.v1;
                _v2 = element.v2;
                _v1.positionScreen.x *= _canvasWidthHalf;
                _v1.positionScreen.y *= _canvasHeightHalf;
                _v2.positionScreen.x *= _canvasWidthHalf;
                _v2.positionScreen.y *= _canvasHeightHalf;
                _elemBox.setFromPoints([
                    _v1.positionScreen,
                    _v2.positionScreen
                ]);
                if (_clipBox.isIntersectionBox(_elemBox) === true) {
                    renderLine(_v1, _v2, element, material);
                }
            } else if (element instanceof THREE.RenderableFace) {
                _v1 = element.v1;
                _v2 = element.v2;
                _v3 = element.v3;
                if (_v1.positionScreen.z < -1 || _v1.positionScreen.z > 1) continue;
                if (_v2.positionScreen.z < -1 || _v2.positionScreen.z > 1) continue;
                if (_v3.positionScreen.z < -1 || _v3.positionScreen.z > 1) continue;
                _v1.positionScreen.x *= _canvasWidthHalf;
                _v1.positionScreen.y *= _canvasHeightHalf;
                _v2.positionScreen.x *= _canvasWidthHalf;
                _v2.positionScreen.y *= _canvasHeightHalf;
                _v3.positionScreen.x *= _canvasWidthHalf;
                _v3.positionScreen.y *= _canvasHeightHalf;
                if (material.overdraw > 0) {
                    expand(_v1.positionScreen, _v2.positionScreen, material.overdraw);
                    expand(_v2.positionScreen, _v3.positionScreen, material.overdraw);
                    expand(_v3.positionScreen, _v1.positionScreen, material.overdraw);
                }
                _elemBox.setFromPoints([
                    _v1.positionScreen,
                    _v2.positionScreen,
                    _v3.positionScreen
                ]);
                if (_clipBox.isIntersectionBox(_elemBox) === true) {
                    renderFace3(_v1, _v2, _v3, 0, 1, 2, element, material);
                }
            }
            /* DEBUG
      setLineWidth( 1 );
      setStrokeStyle( 'rgba( 0, 255, 0, 0.5 )' );
      _context.strokeRect( _elemBox.min.x, _elemBox.min.y, _elemBox.max.x - _elemBox.min.x, _elemBox.max.y - _elemBox.min.y );
      */ _clearBox.union(_elemBox);
        }
        /* DEBUG
    setLineWidth( 1 );
    setStrokeStyle( 'rgba( 255, 0, 0, 0.5 )' );
    _context.strokeRect( _clearBox.min.x, _clearBox.min.y, _clearBox.max.x - _clearBox.min.x, _clearBox.max.y - _clearBox.min.y );
    */ _context.setTransform(1, 0, 0, 1, 0, 0);
    };
    //
    function calculateLights() {
        _ambientLight.setRGB(0, 0, 0);
        _directionalLights.setRGB(0, 0, 0);
        _pointLights.setRGB(0, 0, 0);
        for(var l = 0, ll = _lights.length; l < ll; l++){
            var light = _lights[l];
            var lightColor = light.color;
            if (light instanceof THREE.AmbientLight) {
                _ambientLight.add(lightColor);
            } else if (light instanceof THREE.DirectionalLight) {
                // for sprites
                _directionalLights.add(lightColor);
            } else if (light instanceof THREE.PointLight) {
                // for sprites
                _pointLights.add(lightColor);
            }
        }
    }
    function calculateLight(position, normal, color) {
        for(var l = 0, ll = _lights.length; l < ll; l++){
            var light = _lights[l];
            _lightColor.copy(light.color);
            if (light instanceof THREE.DirectionalLight) {
                var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld).normalize();
                var amount = normal.dot(lightPosition);
                if (amount <= 0) continue;
                amount *= light.intensity;
                color.add(_lightColor.multiplyScalar(amount));
            } else if (light instanceof THREE.PointLight) {
                var lightPosition = _vector3.setFromMatrixPosition(light.matrixWorld);
                var amount = normal.dot(_vector3.subVectors(lightPosition, position).normalize());
                if (amount <= 0) continue;
                amount *= light.distance == 0 ? 1 : 1 - Math.min(position.distanceTo(lightPosition) / light.distance, 1);
                if (amount == 0) continue;
                amount *= light.intensity;
                color.add(_lightColor.multiplyScalar(amount));
            }
        }
    }
    function renderSprite(v1, element, material) {
        setOpacity(material.opacity);
        setBlending(material.blending);
        var scaleX = element.scale.x * _canvasWidthHalf;
        var scaleY = element.scale.y * _canvasHeightHalf;
        var dist = 0.5 * Math.sqrt(scaleX * scaleX + scaleY * scaleY); // allow for rotated sprite
        _elemBox.min.set(v1.x - dist, v1.y - dist);
        _elemBox.max.set(v1.x + dist, v1.y + dist);
        if (material instanceof THREE.SpriteMaterial) {
            var texture = material.map;
            if (texture !== null && texture.image !== undefined) {
                if (texture.hasEventListener('update', onTextureUpdate) === false) {
                    if (texture.image.width > 0) {
                        textureToPattern(texture);
                    }
                    texture.addEventListener('update', onTextureUpdate);
                }
                var pattern = _patterns[texture.id];
                if (pattern !== undefined) {
                    setFillStyle(pattern);
                } else {
                    setFillStyle('rgba( 0, 0, 0, 1 )');
                }
                //
                var bitmap = texture.image;
                var ox = bitmap.width * texture.offset.x;
                var oy = bitmap.height * texture.offset.y;
                var sx = bitmap.width * texture.repeat.x;
                var sy = bitmap.height * texture.repeat.y;
                var cx = scaleX / sx;
                var cy = scaleY / sy;
                _context.save();
                _context.translate(v1.x, v1.y);
                if (material.rotation !== 0) _context.rotate(material.rotation);
                _context.translate(-scaleX / 2, -scaleY / 2);
                _context.scale(cx, cy);
                _context.translate(-ox, -oy);
                _context.fillRect(ox, oy, sx, sy);
                _context.restore();
            } else {
                // no texture
                setFillStyle(material.color.getStyle());
                _context.save();
                _context.translate(v1.x, v1.y);
                if (material.rotation !== 0) _context.rotate(material.rotation);
                _context.scale(scaleX, -scaleY);
                _context.fillRect(-0.5, -0.5, 1, 1);
                _context.restore();
            }
        } else if (material instanceof THREE.SpriteCanvasMaterial) {
            setStrokeStyle(material.color.getStyle());
            setFillStyle(material.color.getStyle());
            _context.save();
            _context.translate(v1.x, v1.y);
            if (material.rotation !== 0) _context.rotate(material.rotation);
            _context.scale(scaleX, scaleY);
            material.program(_context);
            _context.restore();
        }
    /* DEBUG
    setStrokeStyle( 'rgb(255,255,0)' );
    _context.beginPath();
    _context.moveTo( v1.x - 10, v1.y );
    _context.lineTo( v1.x + 10, v1.y );
    _context.moveTo( v1.x, v1.y - 10 );
    _context.lineTo( v1.x, v1.y + 10 );
    _context.stroke();
    */ }
    function renderLine(v1, v2, element, material) {
        setOpacity(material.opacity);
        setBlending(material.blending);
        _context.beginPath();
        _context.moveTo(v1.positionScreen.x, v1.positionScreen.y);
        _context.lineTo(v2.positionScreen.x, v2.positionScreen.y);
        if (material instanceof THREE.LineBasicMaterial) {
            setLineWidth(material.linewidth);
            setLineCap(material.linecap);
            setLineJoin(material.linejoin);
            if (material.vertexColors !== THREE.VertexColors) {
                setStrokeStyle(material.color.getStyle());
            } else {
                var colorStyle1 = element.vertexColors[0].getStyle();
                var colorStyle2 = element.vertexColors[1].getStyle();
                if (colorStyle1 === colorStyle2) {
                    setStrokeStyle(colorStyle1);
                } else {
                    try {
                        var grad = _context.createLinearGradient(v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y);
                        grad.addColorStop(0, colorStyle1);
                        grad.addColorStop(1, colorStyle2);
                    } catch (exception) {
                        grad = colorStyle1;
                    }
                    setStrokeStyle(grad);
                }
            }
            _context.stroke();
            _elemBox.expandByScalar(material.linewidth * 2);
        } else if (material instanceof THREE.LineDashedMaterial) {
            setLineWidth(material.linewidth);
            setLineCap(material.linecap);
            setLineJoin(material.linejoin);
            setStrokeStyle(material.color.getStyle());
            setLineDash([
                material.dashSize,
                material.gapSize
            ]);
            _context.stroke();
            _elemBox.expandByScalar(material.linewidth * 2);
            setLineDash([]);
        }
    }
    function renderFace3(v1, v2, v3, uv1, uv2, uv3, element, material) {
        _this.info.render.vertices += 3;
        _this.info.render.faces++;
        setOpacity(material.opacity);
        setBlending(material.blending);
        _v1x = v1.positionScreen.x;
        _v1y = v1.positionScreen.y;
        _v2x = v2.positionScreen.x;
        _v2y = v2.positionScreen.y;
        _v3x = v3.positionScreen.x;
        _v3y = v3.positionScreen.y;
        drawTriangle(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y);
        if ((material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) && material.map === null) {
            _diffuseColor.copy(material.color);
            _emissiveColor.copy(material.emissive);
            if (material.vertexColors === THREE.FaceColors) {
                _diffuseColor.multiply(element.color);
            }
            _color.copy(_ambientLight);
            _centroid.copy(v1.positionWorld).add(v2.positionWorld).add(v3.positionWorld).divideScalar(3);
            calculateLight(_centroid, element.normalModel, _color);
            _color.multiply(_diffuseColor).add(_emissiveColor);
            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
        } else if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) {
            if (material.map !== null) {
                var mapping = material.map.mapping;
                if (mapping === THREE.UVMapping) {
                    _uvs = element.uvs;
                    patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[uv1].x, _uvs[uv1].y, _uvs[uv2].x, _uvs[uv2].y, _uvs[uv3].x, _uvs[uv3].y, material.map);
                }
            } else if (material.envMap !== null) {
                if (material.envMap.mapping === THREE.SphericalReflectionMapping) {
                    _normal.copy(element.vertexNormalsModel[uv1]).applyMatrix3(_normalViewMatrix);
                    _uv1x = 0.5 * _normal.x + 0.5;
                    _uv1y = 0.5 * _normal.y + 0.5;
                    _normal.copy(element.vertexNormalsModel[uv2]).applyMatrix3(_normalViewMatrix);
                    _uv2x = 0.5 * _normal.x + 0.5;
                    _uv2y = 0.5 * _normal.y + 0.5;
                    _normal.copy(element.vertexNormalsModel[uv3]).applyMatrix3(_normalViewMatrix);
                    _uv3x = 0.5 * _normal.x + 0.5;
                    _uv3y = 0.5 * _normal.y + 0.5;
                    patternPath(_v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap);
                }
            } else {
                _color.copy(material.color);
                if (material.vertexColors === THREE.FaceColors) {
                    _color.multiply(element.color);
                }
                material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
            }
        } else if (material instanceof THREE.MeshDepthMaterial) {
            _color.r = _color.g = _color.b = 1 - smoothstep(v1.positionScreen.z * v1.positionScreen.w, _camera.near, _camera.far);
            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
        } else if (material instanceof THREE.MeshNormalMaterial) {
            _normal.copy(element.normalModel).applyMatrix3(_normalViewMatrix);
            _color.setRGB(_normal.x, _normal.y, _normal.z).multiplyScalar(0.5).addScalar(0.5);
            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
        } else {
            _color.setRGB(1, 1, 1);
            material.wireframe === true ? strokePath(_color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin) : fillPath(_color);
        }
    }
    //
    function drawTriangle(x0, y0, x1, y1, x2, y2) {
        _context.beginPath();
        _context.moveTo(x0, y0);
        _context.lineTo(x1, y1);
        _context.lineTo(x2, y2);
        _context.closePath();
    }
    function strokePath(color, linewidth, linecap, linejoin) {
        setLineWidth(linewidth);
        setLineCap(linecap);
        setLineJoin(linejoin);
        setStrokeStyle(color.getStyle());
        _context.stroke();
        _elemBox.expandByScalar(linewidth * 2);
    }
    function fillPath(color) {
        setFillStyle(color.getStyle());
        _context.fill();
    }
    function onTextureUpdate(event) {
        textureToPattern(event.target);
    }
    function textureToPattern(texture) {
        if (texture instanceof THREE.CompressedTexture) return;
        var repeatX = texture.wrapS === THREE.RepeatWrapping;
        var repeatY = texture.wrapT === THREE.RepeatWrapping;
        var image = texture.image;
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, -1, 0, image.height);
        context.drawImage(image, 0, 0);
        _patterns[texture.id] = _context.createPattern(canvas, repeatX === true && repeatY === true ? 'repeat' : repeatX === true && repeatY === false ? 'repeat-x' : repeatX === false && repeatY === true ? 'repeat-y' : 'no-repeat');
    }
    function patternPath(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture) {
        if (texture instanceof THREE.DataTexture) return;
        if (texture.hasEventListener('update', onTextureUpdate) === false) {
            if (texture.image !== undefined && texture.image.width > 0) {
                textureToPattern(texture);
            }
            texture.addEventListener('update', onTextureUpdate);
        }
        var pattern = _patterns[texture.id];
        if (pattern !== undefined) {
            setFillStyle(pattern);
        } else {
            setFillStyle('rgba(0,0,0,1)');
            _context.fill();
            return;
        }
        // http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
        var a, b, c, d, e, f, det, idet, offsetX = texture.offset.x / texture.repeat.x, offsetY = texture.offset.y / texture.repeat.y, width = texture.image.width * texture.repeat.x, height = texture.image.height * texture.repeat.y;
        u0 = (u0 + offsetX) * width;
        v0 = (v0 + offsetY) * height;
        u1 = (u1 + offsetX) * width;
        v1 = (v1 + offsetY) * height;
        u2 = (u2 + offsetX) * width;
        v2 = (v2 + offsetY) * height;
        x1 -= x0;
        y1 -= y0;
        x2 -= x0;
        y2 -= y0;
        u1 -= u0;
        v1 -= v0;
        u2 -= u0;
        v2 -= v0;
        det = u1 * v2 - u2 * v1;
        if (det === 0) return;
        idet = 1 / det;
        a = (v2 * x1 - v1 * x2) * idet;
        b = (v2 * y1 - v1 * y2) * idet;
        c = (u1 * x2 - u2 * x1) * idet;
        d = (u1 * y2 - u2 * y1) * idet;
        e = x0 - a * u0 - c * v0;
        f = y0 - b * u0 - d * v0;
        _context.save();
        _context.transform(a, b, c, d, e, f);
        _context.fill();
        _context.restore();
    }
    function clipImage(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image) {
        // http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
        var a, b, c, d, e, f, det, idet, width = image.width - 1, height = image.height - 1;
        u0 *= width;
        v0 *= height;
        u1 *= width;
        v1 *= height;
        u2 *= width;
        v2 *= height;
        x1 -= x0;
        y1 -= y0;
        x2 -= x0;
        y2 -= y0;
        u1 -= u0;
        v1 -= v0;
        u2 -= u0;
        v2 -= v0;
        det = u1 * v2 - u2 * v1;
        idet = 1 / det;
        a = (v2 * x1 - v1 * x2) * idet;
        b = (v2 * y1 - v1 * y2) * idet;
        c = (u1 * x2 - u2 * x1) * idet;
        d = (u1 * y2 - u2 * y1) * idet;
        e = x0 - a * u0 - c * v0;
        f = y0 - b * u0 - d * v0;
        _context.save();
        _context.transform(a, b, c, d, e, f);
        _context.clip();
        _context.drawImage(image, 0, 0);
        _context.restore();
    }
    // Hide anti-alias gaps
    function expand(v1, v2, pixels) {
        var x = v2.x - v1.x, y = v2.y - v1.y, det = x * x + y * y, idet;
        if (det === 0) return;
        idet = pixels / Math.sqrt(det);
        x *= idet;
        y *= idet;
        v2.x += x;
        v2.y += y;
        v1.x -= x;
        v1.y -= y;
    }
    // Context cached methods.
    function setOpacity(value) {
        if (_contextGlobalAlpha !== value) {
            _context.globalAlpha = value;
            _contextGlobalAlpha = value;
        }
    }
    function setBlending(value) {
        if (_contextGlobalCompositeOperation !== value) {
            if (value === THREE.NormalBlending) {
                _context.globalCompositeOperation = 'source-over';
            } else if (value === THREE.AdditiveBlending) {
                _context.globalCompositeOperation = 'lighter';
            } else if (value === THREE.SubtractiveBlending) {
                _context.globalCompositeOperation = 'darker';
            }
            _contextGlobalCompositeOperation = value;
        }
    }
    function setLineWidth(value) {
        if (_contextLineWidth !== value) {
            _context.lineWidth = value;
            _contextLineWidth = value;
        }
    }
    function setLineCap(value) {
        // "butt", "round", "square"
        if (_contextLineCap !== value) {
            _context.lineCap = value;
            _contextLineCap = value;
        }
    }
    function setLineJoin(value) {
        // "round", "bevel", "miter"
        if (_contextLineJoin !== value) {
            _context.lineJoin = value;
            _contextLineJoin = value;
        }
    }
    function setStrokeStyle(value) {
        if (_contextStrokeStyle !== value) {
            _context.strokeStyle = value;
            _contextStrokeStyle = value;
        }
    }
    function setFillStyle(value) {
        if (_contextFillStyle !== value) {
            _context.fillStyle = value;
            _contextFillStyle = value;
        }
    }
    function setLineDash(value) {
        if (_contextLineDash.length !== value.length) {
            _context.setLineDash(value);
            _contextLineDash = value;
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvdGhyZWUtcjcxLUNhbnZhc1JlbmRlcmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqL1xuXG5USFJFRS5TcHJpdGVDYW52YXNNYXRlcmlhbCA9IGZ1bmN0aW9uICggcGFyYW1ldGVycyApIHtcblxuICBUSFJFRS5NYXRlcmlhbC5jYWxsKCB0aGlzICk7XG5cbiAgdGhpcy50eXBlID0gJ1Nwcml0ZUNhbnZhc01hdGVyaWFsJztcblxuICB0aGlzLmNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCAweGZmZmZmZiApO1xuICB0aGlzLnByb2dyYW0gPSBmdW5jdGlvbiAoIGNvbnRleHQsIGNvbG9yICkge307XG5cbiAgdGhpcy5zZXRWYWx1ZXMoIHBhcmFtZXRlcnMgKTtcblxufTtcblxuVEhSRUUuU3ByaXRlQ2FudmFzTWF0ZXJpYWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuTWF0ZXJpYWwucHJvdG90eXBlICk7XG5USFJFRS5TcHJpdGVDYW52YXNNYXRlcmlhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUSFJFRS5TcHJpdGVDYW52YXNNYXRlcmlhbDtcblxuVEhSRUUuU3ByaXRlQ2FudmFzTWF0ZXJpYWwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TcHJpdGVDYW52YXNNYXRlcmlhbCgpO1xuXG4gIFRIUkVFLk1hdGVyaWFsLnByb3RvdHlwZS5jbG9uZS5jYWxsKCB0aGlzLCBtYXRlcmlhbCApO1xuXG4gIG1hdGVyaWFsLmNvbG9yLmNvcHkoIHRoaXMuY29sb3IgKTtcbiAgbWF0ZXJpYWwucHJvZ3JhbSA9IHRoaXMucHJvZ3JhbTtcblxuICByZXR1cm4gbWF0ZXJpYWw7XG5cbn07XG5cbi8vXG5cblRIUkVFLkNhbnZhc1JlbmRlcmVyID0gZnVuY3Rpb24gKCBwYXJhbWV0ZXJzICkge1xuXG4gIGNvbnNvbGUubG9nKCAnVEhSRUUuQ2FudmFzUmVuZGVyZXInLCBUSFJFRS5SRVZJU0lPTiApO1xuXG4gIHZhciBzbW9vdGhzdGVwID0gVEhSRUUuTWF0aC5zbW9vdGhzdGVwO1xuXG4gIHBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzIHx8IHt9O1xuXG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gIF9yZW5kZXJEYXRhLCBfZWxlbWVudHMsIF9saWdodHMsXG4gIF9wcm9qZWN0b3IgPSBuZXcgVEhSRUUuUHJvamVjdG9yKCksXG5cbiAgX2NhbnZhcyA9IHBhcmFtZXRlcnMuY2FudmFzICE9PSB1bmRlZmluZWRcbiAgICAgICA/IHBhcmFtZXRlcnMuY2FudmFzXG4gICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApLFxuXG4gIF9jYW52YXNXaWR0aCA9IF9jYW52YXMud2lkdGgsXG4gIF9jYW52YXNIZWlnaHQgPSBfY2FudmFzLmhlaWdodCxcbiAgX2NhbnZhc1dpZHRoSGFsZiA9IE1hdGguZmxvb3IoIF9jYW52YXNXaWR0aCAvIDIgKSxcbiAgX2NhbnZhc0hlaWdodEhhbGYgPSBNYXRoLmZsb29yKCBfY2FudmFzSGVpZ2h0IC8gMiApLFxuXG4gIF92aWV3cG9ydFggPSAwLFxuICBfdmlld3BvcnRZID0gMCxcbiAgX3ZpZXdwb3J0V2lkdGggPSBfY2FudmFzV2lkdGgsXG4gIF92aWV3cG9ydEhlaWdodCA9IF9jYW52YXNIZWlnaHQsXG5cbiAgcGl4ZWxSYXRpbyA9IDEsXG5cbiAgX2NvbnRleHQgPSBfY2FudmFzLmdldENvbnRleHQoICcyZCcsIHtcbiAgICBhbHBoYTogcGFyYW1ldGVycy5hbHBoYSA9PT0gdHJ1ZVxuICB9ICksXG5cbiAgX2NsZWFyQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoIDB4MDAwMDAwICksXG4gIF9jbGVhckFscGhhID0gcGFyYW1ldGVycy5hbHBoYSA9PT0gdHJ1ZSA/IDAgOiAxLFxuXG4gIF9jb250ZXh0R2xvYmFsQWxwaGEgPSAxLFxuICBfY29udGV4dEdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IDAsXG4gIF9jb250ZXh0U3Ryb2tlU3R5bGUgPSBudWxsLFxuICBfY29udGV4dEZpbGxTdHlsZSA9IG51bGwsXG4gIF9jb250ZXh0TGluZVdpZHRoID0gbnVsbCxcbiAgX2NvbnRleHRMaW5lQ2FwID0gbnVsbCxcbiAgX2NvbnRleHRMaW5lSm9pbiA9IG51bGwsXG4gIF9jb250ZXh0TGluZURhc2ggPSBbXSxcblxuICBfY2FtZXJhLFxuXG4gIF92MSwgX3YyLCBfdjMsIF92NCxcbiAgX3Y1ID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKSxcbiAgX3Y2ID0gbmV3IFRIUkVFLlJlbmRlcmFibGVWZXJ0ZXgoKSxcblxuICBfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5LFxuICBfdjR4LCBfdjR5LCBfdjV4LCBfdjV5LCBfdjZ4LCBfdjZ5LFxuXG4gIF9jb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpLFxuICBfY29sb3IxID0gbmV3IFRIUkVFLkNvbG9yKCksXG4gIF9jb2xvcjIgPSBuZXcgVEhSRUUuQ29sb3IoKSxcbiAgX2NvbG9yMyA9IG5ldyBUSFJFRS5Db2xvcigpLFxuICBfY29sb3I0ID0gbmV3IFRIUkVFLkNvbG9yKCksXG5cbiAgX2RpZmZ1c2VDb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpLFxuICBfZW1pc3NpdmVDb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpLFxuXG4gIF9saWdodENvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCksXG5cbiAgX3BhdHRlcm5zID0ge30sXG5cbiAgX2ltYWdlLCBfdXZzLFxuICBfdXYxeCwgX3V2MXksIF91djJ4LCBfdXYyeSwgX3V2M3gsIF91djN5LFxuXG4gIF9jbGlwQm94ID0gbmV3IFRIUkVFLkJveDIoKSxcbiAgX2NsZWFyQm94ID0gbmV3IFRIUkVFLkJveDIoKSxcbiAgX2VsZW1Cb3ggPSBuZXcgVEhSRUUuQm94MigpLFxuXG4gIF9hbWJpZW50TGlnaHQgPSBuZXcgVEhSRUUuQ29sb3IoKSxcbiAgX2RpcmVjdGlvbmFsTGlnaHRzID0gbmV3IFRIUkVFLkNvbG9yKCksXG4gIF9wb2ludExpZ2h0cyA9IG5ldyBUSFJFRS5Db2xvcigpLFxuXG4gIF92ZWN0b3IzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSwgLy8gTmVlZGVkIGZvciBQb2ludExpZ2h0XG4gIF9jZW50cm9pZCA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG4gIF9ub3JtYWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuICBfbm9ybWFsVmlld01hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXgzKCk7XG5cbiAgLy8gZGFzaCtnYXAgZmFsbGJhY2tzIGZvciBGaXJlZm94IGFuZCBldmVyeXRoaW5nIGVsc2VcblxuICBpZiAoIF9jb250ZXh0LnNldExpbmVEYXNoID09PSB1bmRlZmluZWQgKSB7XG5cbiAgICBfY29udGV4dC5zZXRMaW5lRGFzaCA9IGZ1bmN0aW9uICgpIHt9XG5cbiAgfVxuXG4gIHRoaXMuZG9tRWxlbWVudCA9IF9jYW52YXM7XG5cbiAgdGhpcy5hdXRvQ2xlYXIgPSB0cnVlO1xuICB0aGlzLnNvcnRPYmplY3RzID0gdHJ1ZTtcbiAgdGhpcy5zb3J0RWxlbWVudHMgPSB0cnVlO1xuXG4gIHRoaXMuaW5mbyA9IHtcblxuICAgIHJlbmRlcjoge1xuXG4gICAgICB2ZXJ0aWNlczogMCxcbiAgICAgIGZhY2VzOiAwXG5cbiAgICB9XG5cbiAgfVxuXG4gIC8vIFdlYkdMUmVuZGVyZXIgY29tcGF0aWJpbGl0eVxuXG4gIHRoaXMuc3VwcG9ydHNWZXJ0ZXhUZXh0dXJlcyA9IGZ1bmN0aW9uICgpIHt9O1xuICB0aGlzLnNldEZhY2VDdWxsaW5nID0gZnVuY3Rpb24gKCkge307XG5cbiAgLy9cblxuICB0aGlzLmdldFBpeGVsUmF0aW8gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4gcGl4ZWxSYXRpbztcblxuICB9O1xuXG4gIHRoaXMuc2V0UGl4ZWxSYXRpbyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cbiAgICBwaXhlbFJhdGlvID0gdmFsdWU7XG5cbiAgfTtcblxuICB0aGlzLnNldFNpemUgPSBmdW5jdGlvbiAoIHdpZHRoLCBoZWlnaHQsIHVwZGF0ZVN0eWxlICkge1xuXG4gICAgX2NhbnZhc1dpZHRoID0gd2lkdGggKiBwaXhlbFJhdGlvO1xuICAgIF9jYW52YXNIZWlnaHQgPSBoZWlnaHQgKiBwaXhlbFJhdGlvO1xuXG4gICAgX2NhbnZhcy53aWR0aCA9IF9jYW52YXNXaWR0aDtcbiAgICBfY2FudmFzLmhlaWdodCA9IF9jYW52YXNIZWlnaHQ7XG5cbiAgICBfY2FudmFzV2lkdGhIYWxmID0gTWF0aC5mbG9vciggX2NhbnZhc1dpZHRoIC8gMiApO1xuICAgIF9jYW52YXNIZWlnaHRIYWxmID0gTWF0aC5mbG9vciggX2NhbnZhc0hlaWdodCAvIDIgKTtcblxuICAgIGlmICggdXBkYXRlU3R5bGUgIT09IGZhbHNlICkge1xuXG4gICAgICBfY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgICAgX2NhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuXG4gICAgfVxuXG4gICAgX2NsaXBCb3gubWluLnNldCggLV9jYW52YXNXaWR0aEhhbGYsIC1fY2FudmFzSGVpZ2h0SGFsZiApLFxuICAgIF9jbGlwQm94Lm1heC5zZXQoICAgX2NhbnZhc1dpZHRoSGFsZiwgICBfY2FudmFzSGVpZ2h0SGFsZiApO1xuXG4gICAgX2NsZWFyQm94Lm1pbi5zZXQoIC0gX2NhbnZhc1dpZHRoSGFsZiwgLSBfY2FudmFzSGVpZ2h0SGFsZiApO1xuICAgIF9jbGVhckJveC5tYXguc2V0KCAgIF9jYW52YXNXaWR0aEhhbGYsICAgX2NhbnZhc0hlaWdodEhhbGYgKTtcblxuICAgIF9jb250ZXh0R2xvYmFsQWxwaGEgPSAxO1xuICAgIF9jb250ZXh0R2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gMDtcbiAgICBfY29udGV4dFN0cm9rZVN0eWxlID0gbnVsbDtcbiAgICBfY29udGV4dEZpbGxTdHlsZSA9IG51bGw7XG4gICAgX2NvbnRleHRMaW5lV2lkdGggPSBudWxsO1xuICAgIF9jb250ZXh0TGluZUNhcCA9IG51bGw7XG4gICAgX2NvbnRleHRMaW5lSm9pbiA9IG51bGw7XG5cbiAgICB0aGlzLnNldFZpZXdwb3J0KCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG5cbiAgfTtcblxuICB0aGlzLnNldFZpZXdwb3J0ID0gZnVuY3Rpb24gKCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkge1xuXG4gICAgX3ZpZXdwb3J0WCA9IHggKiBwaXhlbFJhdGlvO1xuICAgIF92aWV3cG9ydFkgPSB5ICogcGl4ZWxSYXRpbztcblxuICAgIF92aWV3cG9ydFdpZHRoID0gd2lkdGggKiBwaXhlbFJhdGlvO1xuICAgIF92aWV3cG9ydEhlaWdodCA9IGhlaWdodCAqIHBpeGVsUmF0aW87XG5cbiAgfTtcblxuICB0aGlzLnNldFNjaXNzb3IgPSBmdW5jdGlvbiAoKSB7fTtcbiAgdGhpcy5lbmFibGVTY2lzc29yVGVzdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gIHRoaXMuc2V0Q2xlYXJDb2xvciA9IGZ1bmN0aW9uICggY29sb3IsIGFscGhhICkge1xuXG4gICAgX2NsZWFyQ29sb3Iuc2V0KCBjb2xvciApO1xuICAgIF9jbGVhckFscGhhID0gYWxwaGEgIT09IHVuZGVmaW5lZCA/IGFscGhhIDogMTtcblxuICAgIF9jbGVhckJveC5taW4uc2V0KCAtIF9jYW52YXNXaWR0aEhhbGYsIC0gX2NhbnZhc0hlaWdodEhhbGYgKTtcbiAgICBfY2xlYXJCb3gubWF4LnNldCggICBfY2FudmFzV2lkdGhIYWxmLCAgIF9jYW52YXNIZWlnaHRIYWxmICk7XG5cbiAgfTtcblxuICB0aGlzLnNldENsZWFyQ29sb3JIZXggPSBmdW5jdGlvbiAoIGhleCwgYWxwaGEgKSB7XG5cbiAgICBjb25zb2xlLndhcm4oICdUSFJFRS5DYW52YXNSZW5kZXJlcjogLnNldENsZWFyQ29sb3JIZXgoKSBpcyBiZWluZyByZW1vdmVkLiBVc2UgLnNldENsZWFyQ29sb3IoKSBpbnN0ZWFkLicgKTtcbiAgICB0aGlzLnNldENsZWFyQ29sb3IoIGhleCwgYWxwaGEgKTtcblxuICB9O1xuXG4gIHRoaXMuZ2V0Q2xlYXJDb2xvciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBfY2xlYXJDb2xvcjtcblxuICB9O1xuXG4gIHRoaXMuZ2V0Q2xlYXJBbHBoYSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBfY2xlYXJBbHBoYTtcblxuICB9O1xuXG4gIHRoaXMuZ2V0TWF4QW5pc290cm9weSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiAwO1xuXG4gIH07XG5cbiAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICggX2NsZWFyQm94LmVtcHR5KCkgPT09IGZhbHNlICkge1xuXG4gICAgICBfY2xlYXJCb3guaW50ZXJzZWN0KCBfY2xpcEJveCApO1xuICAgICAgX2NsZWFyQm94LmV4cGFuZEJ5U2NhbGFyKCAyICk7XG5cbiAgICAgIF9jbGVhckJveC5taW4ueCA9IF9jbGVhckJveC5taW4ueCArIF9jYW52YXNXaWR0aEhhbGY7XG4gICAgICBfY2xlYXJCb3gubWluLnkgPSAgLSBfY2xlYXJCb3gubWluLnkgKyBfY2FudmFzSGVpZ2h0SGFsZjsgICAvLyBoaWdoZXIgeSB2YWx1ZSAhXG4gICAgICBfY2xlYXJCb3gubWF4LnggPSBfY2xlYXJCb3gubWF4LnggKyBfY2FudmFzV2lkdGhIYWxmO1xuICAgICAgX2NsZWFyQm94Lm1heC55ID0gIC0gX2NsZWFyQm94Lm1heC55ICsgX2NhbnZhc0hlaWdodEhhbGY7ICAgLy8gbG93ZXIgeSB2YWx1ZSAhXG5cbiAgICAgIGlmICggX2NsZWFyQWxwaGEgPCAxICkge1xuXG4gICAgICAgIF9jb250ZXh0LmNsZWFyUmVjdChcbiAgICAgICAgICBfY2xlYXJCb3gubWluLnggfCAwLFxuICAgICAgICAgIF9jbGVhckJveC5tYXgueSB8IDAsXG4gICAgICAgICAgKCBfY2xlYXJCb3gubWF4LnggLSBfY2xlYXJCb3gubWluLnggKSB8IDAsXG4gICAgICAgICAgKCBfY2xlYXJCb3gubWluLnkgLSBfY2xlYXJCb3gubWF4LnkgKSB8IDBcbiAgICAgICAgKTtcblxuICAgICAgfVxuXG4gICAgICBpZiAoIF9jbGVhckFscGhhID4gMCApIHtcblxuICAgICAgICBzZXRCbGVuZGluZyggVEhSRUUuTm9ybWFsQmxlbmRpbmcgKTtcbiAgICAgICAgc2V0T3BhY2l0eSggMSApO1xuXG4gICAgICAgIHNldEZpbGxTdHlsZSggJ3JnYmEoJyArIE1hdGguZmxvb3IoIF9jbGVhckNvbG9yLnIgKiAyNTUgKSArICcsJyArIE1hdGguZmxvb3IoIF9jbGVhckNvbG9yLmcgKiAyNTUgKSArICcsJyArIE1hdGguZmxvb3IoIF9jbGVhckNvbG9yLmIgKiAyNTUgKSArICcsJyArIF9jbGVhckFscGhhICsgJyknICk7XG5cbiAgICAgICAgX2NvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgICAgX2NsZWFyQm94Lm1pbi54IHwgMCxcbiAgICAgICAgICBfY2xlYXJCb3gubWF4LnkgfCAwLFxuICAgICAgICAgICggX2NsZWFyQm94Lm1heC54IC0gX2NsZWFyQm94Lm1pbi54ICkgfCAwLFxuICAgICAgICAgICggX2NsZWFyQm94Lm1pbi55IC0gX2NsZWFyQm94Lm1heC55ICkgfCAwXG4gICAgICAgICk7XG5cbiAgICAgIH1cblxuICAgICAgX2NsZWFyQm94Lm1ha2VFbXB0eSgpO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgLy8gY29tcGF0aWJpbGl0eVxuXG4gIHRoaXMuY2xlYXJDb2xvciA9IGZ1bmN0aW9uICgpIHt9O1xuICB0aGlzLmNsZWFyRGVwdGggPSBmdW5jdGlvbiAoKSB7fTtcbiAgdGhpcy5jbGVhclN0ZW5jaWwgPSBmdW5jdGlvbiAoKSB7fTtcblxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblxuICAgIGlmICggY2FtZXJhIGluc3RhbmNlb2YgVEhSRUUuQ2FtZXJhID09PSBmYWxzZSApIHtcblxuICAgICAgY29uc29sZS5lcnJvciggJ1RIUkVFLkNhbnZhc1JlbmRlcmVyLnJlbmRlcjogY2FtZXJhIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBUSFJFRS5DYW1lcmEuJyApO1xuICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmF1dG9DbGVhciA9PT0gdHJ1ZSApIHRoaXMuY2xlYXIoKTtcblxuICAgIF90aGlzLmluZm8ucmVuZGVyLnZlcnRpY2VzID0gMDtcbiAgICBfdGhpcy5pbmZvLnJlbmRlci5mYWNlcyA9IDA7XG5cbiAgICBfY29udGV4dC5zZXRUcmFuc2Zvcm0oIF92aWV3cG9ydFdpZHRoIC8gX2NhbnZhc1dpZHRoLCAwLCAwLCAtIF92aWV3cG9ydEhlaWdodCAvIF9jYW52YXNIZWlnaHQsIF92aWV3cG9ydFgsIF9jYW52YXNIZWlnaHQgLSBfdmlld3BvcnRZICk7XG4gICAgX2NvbnRleHQudHJhbnNsYXRlKCBfY2FudmFzV2lkdGhIYWxmLCBfY2FudmFzSGVpZ2h0SGFsZiApO1xuXG4gICAgX3JlbmRlckRhdGEgPSBfcHJvamVjdG9yLnByb2plY3RTY2VuZSggc2NlbmUsIGNhbWVyYSwgdGhpcy5zb3J0T2JqZWN0cywgdGhpcy5zb3J0RWxlbWVudHMgKTtcbiAgICBfZWxlbWVudHMgPSBfcmVuZGVyRGF0YS5lbGVtZW50cztcbiAgICBfbGlnaHRzID0gX3JlbmRlckRhdGEubGlnaHRzO1xuICAgIF9jYW1lcmEgPSBjYW1lcmE7XG5cbiAgICBfbm9ybWFsVmlld01hdHJpeC5nZXROb3JtYWxNYXRyaXgoIGNhbWVyYS5tYXRyaXhXb3JsZEludmVyc2UgKTtcblxuICAgIC8qIERFQlVHXG4gICAgc2V0RmlsbFN0eWxlKCAncmdiYSggMCwgMjU1LCAyNTUsIDAuNSApJyApO1xuICAgIF9jb250ZXh0LmZpbGxSZWN0KCBfY2xpcEJveC5taW4ueCwgX2NsaXBCb3gubWluLnksIF9jbGlwQm94Lm1heC54IC0gX2NsaXBCb3gubWluLngsIF9jbGlwQm94Lm1heC55IC0gX2NsaXBCb3gubWluLnkgKTtcbiAgICAqL1xuXG4gICAgY2FsY3VsYXRlTGlnaHRzKCk7XG5cbiAgICBmb3IgKCB2YXIgZSA9IDAsIGVsID0gX2VsZW1lbnRzLmxlbmd0aDsgZSA8IGVsOyBlICsrICkge1xuXG4gICAgICB2YXIgZWxlbWVudCA9IF9lbGVtZW50c1sgZSBdO1xuXG4gICAgICB2YXIgbWF0ZXJpYWwgPSBlbGVtZW50Lm1hdGVyaWFsO1xuXG4gICAgICBpZiAoIG1hdGVyaWFsID09PSB1bmRlZmluZWQgfHwgbWF0ZXJpYWwub3BhY2l0eSA9PT0gMCApIGNvbnRpbnVlO1xuXG4gICAgICBfZWxlbUJveC5tYWtlRW1wdHkoKTtcblxuICAgICAgaWYgKCBlbGVtZW50IGluc3RhbmNlb2YgVEhSRUUuUmVuZGVyYWJsZVNwcml0ZSApIHtcblxuICAgICAgICBfdjEgPSBlbGVtZW50O1xuICAgICAgICBfdjEueCAqPSBfY2FudmFzV2lkdGhIYWxmOyBfdjEueSAqPSBfY2FudmFzSGVpZ2h0SGFsZjtcblxuICAgICAgICByZW5kZXJTcHJpdGUoIF92MSwgZWxlbWVudCwgbWF0ZXJpYWwgKTtcblxuICAgICAgfSBlbHNlIGlmICggZWxlbWVudCBpbnN0YW5jZW9mIFRIUkVFLlJlbmRlcmFibGVMaW5lICkge1xuXG4gICAgICAgIF92MSA9IGVsZW1lbnQudjE7IF92MiA9IGVsZW1lbnQudjI7XG5cbiAgICAgICAgX3YxLnBvc2l0aW9uU2NyZWVuLnggKj0gX2NhbnZhc1dpZHRoSGFsZjsgX3YxLnBvc2l0aW9uU2NyZWVuLnkgKj0gX2NhbnZhc0hlaWdodEhhbGY7XG4gICAgICAgIF92Mi5wb3NpdGlvblNjcmVlbi54ICo9IF9jYW52YXNXaWR0aEhhbGY7IF92Mi5wb3NpdGlvblNjcmVlbi55ICo9IF9jYW52YXNIZWlnaHRIYWxmO1xuXG4gICAgICAgIF9lbGVtQm94LnNldEZyb21Qb2ludHMoIFtcbiAgICAgICAgICBfdjEucG9zaXRpb25TY3JlZW4sXG4gICAgICAgICAgX3YyLnBvc2l0aW9uU2NyZWVuXG4gICAgICAgIF0gKTtcblxuICAgICAgICBpZiAoIF9jbGlwQm94LmlzSW50ZXJzZWN0aW9uQm94KCBfZWxlbUJveCApID09PSB0cnVlICkge1xuXG4gICAgICAgICAgcmVuZGVyTGluZSggX3YxLCBfdjIsIGVsZW1lbnQsIG1hdGVyaWFsICk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKCBlbGVtZW50IGluc3RhbmNlb2YgVEhSRUUuUmVuZGVyYWJsZUZhY2UgKSB7XG5cbiAgICAgICAgX3YxID0gZWxlbWVudC52MTsgX3YyID0gZWxlbWVudC52MjsgX3YzID0gZWxlbWVudC52MztcblxuICAgICAgICBpZiAoIF92MS5wb3NpdGlvblNjcmVlbi56IDwgLSAxIHx8IF92MS5wb3NpdGlvblNjcmVlbi56ID4gMSApIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIF92Mi5wb3NpdGlvblNjcmVlbi56IDwgLSAxIHx8IF92Mi5wb3NpdGlvblNjcmVlbi56ID4gMSApIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIF92My5wb3NpdGlvblNjcmVlbi56IDwgLSAxIHx8IF92My5wb3NpdGlvblNjcmVlbi56ID4gMSApIGNvbnRpbnVlO1xuXG4gICAgICAgIF92MS5wb3NpdGlvblNjcmVlbi54ICo9IF9jYW52YXNXaWR0aEhhbGY7IF92MS5wb3NpdGlvblNjcmVlbi55ICo9IF9jYW52YXNIZWlnaHRIYWxmO1xuICAgICAgICBfdjIucG9zaXRpb25TY3JlZW4ueCAqPSBfY2FudmFzV2lkdGhIYWxmOyBfdjIucG9zaXRpb25TY3JlZW4ueSAqPSBfY2FudmFzSGVpZ2h0SGFsZjtcbiAgICAgICAgX3YzLnBvc2l0aW9uU2NyZWVuLnggKj0gX2NhbnZhc1dpZHRoSGFsZjsgX3YzLnBvc2l0aW9uU2NyZWVuLnkgKj0gX2NhbnZhc0hlaWdodEhhbGY7XG5cbiAgICAgICAgaWYgKCBtYXRlcmlhbC5vdmVyZHJhdyA+IDAgKSB7XG5cbiAgICAgICAgICBleHBhbmQoIF92MS5wb3NpdGlvblNjcmVlbiwgX3YyLnBvc2l0aW9uU2NyZWVuLCBtYXRlcmlhbC5vdmVyZHJhdyApO1xuICAgICAgICAgIGV4cGFuZCggX3YyLnBvc2l0aW9uU2NyZWVuLCBfdjMucG9zaXRpb25TY3JlZW4sIG1hdGVyaWFsLm92ZXJkcmF3ICk7XG4gICAgICAgICAgZXhwYW5kKCBfdjMucG9zaXRpb25TY3JlZW4sIF92MS5wb3NpdGlvblNjcmVlbiwgbWF0ZXJpYWwub3ZlcmRyYXcgKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgX2VsZW1Cb3guc2V0RnJvbVBvaW50cyggW1xuICAgICAgICAgIF92MS5wb3NpdGlvblNjcmVlbixcbiAgICAgICAgICBfdjIucG9zaXRpb25TY3JlZW4sXG4gICAgICAgICAgX3YzLnBvc2l0aW9uU2NyZWVuXG4gICAgICAgIF0gKTtcblxuICAgICAgICBpZiAoIF9jbGlwQm94LmlzSW50ZXJzZWN0aW9uQm94KCBfZWxlbUJveCApID09PSB0cnVlICkge1xuXG4gICAgICAgICAgcmVuZGVyRmFjZTMoIF92MSwgX3YyLCBfdjMsIDAsIDEsIDIsIGVsZW1lbnQsIG1hdGVyaWFsICk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIC8qIERFQlVHXG4gICAgICBzZXRMaW5lV2lkdGgoIDEgKTtcbiAgICAgIHNldFN0cm9rZVN0eWxlKCAncmdiYSggMCwgMjU1LCAwLCAwLjUgKScgKTtcbiAgICAgIF9jb250ZXh0LnN0cm9rZVJlY3QoIF9lbGVtQm94Lm1pbi54LCBfZWxlbUJveC5taW4ueSwgX2VsZW1Cb3gubWF4LnggLSBfZWxlbUJveC5taW4ueCwgX2VsZW1Cb3gubWF4LnkgLSBfZWxlbUJveC5taW4ueSApO1xuICAgICAgKi9cblxuICAgICAgX2NsZWFyQm94LnVuaW9uKCBfZWxlbUJveCApO1xuXG4gICAgfVxuXG4gICAgLyogREVCVUdcbiAgICBzZXRMaW5lV2lkdGgoIDEgKTtcbiAgICBzZXRTdHJva2VTdHlsZSggJ3JnYmEoIDI1NSwgMCwgMCwgMC41ICknICk7XG4gICAgX2NvbnRleHQuc3Ryb2tlUmVjdCggX2NsZWFyQm94Lm1pbi54LCBfY2xlYXJCb3gubWluLnksIF9jbGVhckJveC5tYXgueCAtIF9jbGVhckJveC5taW4ueCwgX2NsZWFyQm94Lm1heC55IC0gX2NsZWFyQm94Lm1pbi55ICk7XG4gICAgKi9cblxuICAgIF9jb250ZXh0LnNldFRyYW5zZm9ybSggMSwgMCwgMCwgMSwgMCwgMCApO1xuXG4gIH07XG5cbiAgLy9cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVMaWdodHMoKSB7XG5cbiAgICBfYW1iaWVudExpZ2h0LnNldFJHQiggMCwgMCwgMCApO1xuICAgIF9kaXJlY3Rpb25hbExpZ2h0cy5zZXRSR0IoIDAsIDAsIDAgKTtcbiAgICBfcG9pbnRMaWdodHMuc2V0UkdCKCAwLCAwLCAwICk7XG5cbiAgICBmb3IgKCB2YXIgbCA9IDAsIGxsID0gX2xpZ2h0cy5sZW5ndGg7IGwgPCBsbDsgbCArKyApIHtcblxuICAgICAgdmFyIGxpZ2h0ID0gX2xpZ2h0c1sgbCBdO1xuICAgICAgdmFyIGxpZ2h0Q29sb3IgPSBsaWdodC5jb2xvcjtcblxuICAgICAgaWYgKCBsaWdodCBpbnN0YW5jZW9mIFRIUkVFLkFtYmllbnRMaWdodCApIHtcblxuICAgICAgICBfYW1iaWVudExpZ2h0LmFkZCggbGlnaHRDb2xvciApO1xuXG4gICAgICB9IGVsc2UgaWYgKCBsaWdodCBpbnN0YW5jZW9mIFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQgKSB7XG5cbiAgICAgICAgLy8gZm9yIHNwcml0ZXNcblxuICAgICAgICBfZGlyZWN0aW9uYWxMaWdodHMuYWRkKCBsaWdodENvbG9yICk7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGxpZ2h0IGluc3RhbmNlb2YgVEhSRUUuUG9pbnRMaWdodCApIHtcblxuICAgICAgICAvLyBmb3Igc3ByaXRlc1xuXG4gICAgICAgIF9wb2ludExpZ2h0cy5hZGQoIGxpZ2h0Q29sb3IgKTtcblxuICAgICAgfVxuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVMaWdodCggcG9zaXRpb24sIG5vcm1hbCwgY29sb3IgKSB7XG5cbiAgICBmb3IgKCB2YXIgbCA9IDAsIGxsID0gX2xpZ2h0cy5sZW5ndGg7IGwgPCBsbDsgbCArKyApIHtcblxuICAgICAgdmFyIGxpZ2h0ID0gX2xpZ2h0c1sgbCBdO1xuXG4gICAgICBfbGlnaHRDb2xvci5jb3B5KCBsaWdodC5jb2xvciApO1xuXG4gICAgICBpZiAoIGxpZ2h0IGluc3RhbmNlb2YgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCApIHtcblxuICAgICAgICB2YXIgbGlnaHRQb3NpdGlvbiA9IF92ZWN0b3IzLnNldEZyb21NYXRyaXhQb3NpdGlvbiggbGlnaHQubWF0cml4V29ybGQgKS5ub3JtYWxpemUoKTtcblxuICAgICAgICB2YXIgYW1vdW50ID0gbm9ybWFsLmRvdCggbGlnaHRQb3NpdGlvbiApO1xuXG4gICAgICAgIGlmICggYW1vdW50IDw9IDAgKSBjb250aW51ZTtcblxuICAgICAgICBhbW91bnQgKj0gbGlnaHQuaW50ZW5zaXR5O1xuXG4gICAgICAgIGNvbG9yLmFkZCggX2xpZ2h0Q29sb3IubXVsdGlwbHlTY2FsYXIoIGFtb3VudCApICk7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGxpZ2h0IGluc3RhbmNlb2YgVEhSRUUuUG9pbnRMaWdodCApIHtcblxuICAgICAgICB2YXIgbGlnaHRQb3NpdGlvbiA9IF92ZWN0b3IzLnNldEZyb21NYXRyaXhQb3NpdGlvbiggbGlnaHQubWF0cml4V29ybGQgKTtcblxuICAgICAgICB2YXIgYW1vdW50ID0gbm9ybWFsLmRvdCggX3ZlY3RvcjMuc3ViVmVjdG9ycyggbGlnaHRQb3NpdGlvbiwgcG9zaXRpb24gKS5ub3JtYWxpemUoKSApO1xuXG4gICAgICAgIGlmICggYW1vdW50IDw9IDAgKSBjb250aW51ZTtcblxuICAgICAgICBhbW91bnQgKj0gbGlnaHQuZGlzdGFuY2UgPT0gMCA/IDEgOiAxIC0gTWF0aC5taW4oIHBvc2l0aW9uLmRpc3RhbmNlVG8oIGxpZ2h0UG9zaXRpb24gKSAvIGxpZ2h0LmRpc3RhbmNlLCAxICk7XG5cbiAgICAgICAgaWYgKCBhbW91bnQgPT0gMCApIGNvbnRpbnVlO1xuXG4gICAgICAgIGFtb3VudCAqPSBsaWdodC5pbnRlbnNpdHk7XG5cbiAgICAgICAgY29sb3IuYWRkKCBfbGlnaHRDb2xvci5tdWx0aXBseVNjYWxhciggYW1vdW50ICkgKTtcblxuICAgICAgfVxuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTcHJpdGUoIHYxLCBlbGVtZW50LCBtYXRlcmlhbCApIHtcblxuICAgIHNldE9wYWNpdHkoIG1hdGVyaWFsLm9wYWNpdHkgKTtcbiAgICBzZXRCbGVuZGluZyggbWF0ZXJpYWwuYmxlbmRpbmcgKTtcblxuICAgIHZhciBzY2FsZVggPSBlbGVtZW50LnNjYWxlLnggKiBfY2FudmFzV2lkdGhIYWxmO1xuICAgIHZhciBzY2FsZVkgPSBlbGVtZW50LnNjYWxlLnkgKiBfY2FudmFzSGVpZ2h0SGFsZjtcblxuICAgIHZhciBkaXN0ID0gMC41ICogTWF0aC5zcXJ0KCBzY2FsZVggKiBzY2FsZVggKyBzY2FsZVkgKiBzY2FsZVkgKTsgLy8gYWxsb3cgZm9yIHJvdGF0ZWQgc3ByaXRlXG4gICAgX2VsZW1Cb3gubWluLnNldCggdjEueCAtIGRpc3QsIHYxLnkgLSBkaXN0ICk7XG4gICAgX2VsZW1Cb3gubWF4LnNldCggdjEueCArIGRpc3QsIHYxLnkgKyBkaXN0ICk7XG5cbiAgICBpZiAoIG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuU3ByaXRlTWF0ZXJpYWwgKSB7XG5cbiAgICAgIHZhciB0ZXh0dXJlID0gbWF0ZXJpYWwubWFwO1xuXG4gICAgICBpZiAoIHRleHR1cmUgIT09IG51bGwgJiYgdGV4dHVyZS5pbWFnZSAhPT0gdW5kZWZpbmVkICkge1xuXG4gICAgICAgIGlmICggdGV4dHVyZS5oYXNFdmVudExpc3RlbmVyKCAndXBkYXRlJywgb25UZXh0dXJlVXBkYXRlICkgPT09IGZhbHNlICkge1xuXG4gICAgICAgICAgaWYgKCB0ZXh0dXJlLmltYWdlLndpZHRoID4gMCApIHtcblxuICAgICAgICAgICAgdGV4dHVyZVRvUGF0dGVybiggdGV4dHVyZSApO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGV4dHVyZS5hZGRFdmVudExpc3RlbmVyKCAndXBkYXRlJywgb25UZXh0dXJlVXBkYXRlICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwYXR0ZXJuID0gX3BhdHRlcm5zWyB0ZXh0dXJlLmlkIF07XG5cbiAgICAgICAgaWYgKCBwYXR0ZXJuICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICBzZXRGaWxsU3R5bGUoIHBhdHRlcm4gKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgc2V0RmlsbFN0eWxlKCAncmdiYSggMCwgMCwgMCwgMSApJyApO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvL1xuXG4gICAgICAgIHZhciBiaXRtYXAgPSB0ZXh0dXJlLmltYWdlO1xuXG4gICAgICAgIHZhciBveCA9IGJpdG1hcC53aWR0aCAqIHRleHR1cmUub2Zmc2V0Lng7XG4gICAgICAgIHZhciBveSA9IGJpdG1hcC5oZWlnaHQgKiB0ZXh0dXJlLm9mZnNldC55O1xuXG4gICAgICAgIHZhciBzeCA9IGJpdG1hcC53aWR0aCAqIHRleHR1cmUucmVwZWF0Lng7XG4gICAgICAgIHZhciBzeSA9IGJpdG1hcC5oZWlnaHQgKiB0ZXh0dXJlLnJlcGVhdC55O1xuXG4gICAgICAgIHZhciBjeCA9IHNjYWxlWCAvIHN4O1xuICAgICAgICB2YXIgY3kgPSBzY2FsZVkgLyBzeTtcblxuICAgICAgICBfY29udGV4dC5zYXZlKCk7XG4gICAgICAgIF9jb250ZXh0LnRyYW5zbGF0ZSggdjEueCwgdjEueSApO1xuICAgICAgICBpZiAoIG1hdGVyaWFsLnJvdGF0aW9uICE9PSAwICkgX2NvbnRleHQucm90YXRlKCBtYXRlcmlhbC5yb3RhdGlvbiApO1xuICAgICAgICBfY29udGV4dC50cmFuc2xhdGUoIC0gc2NhbGVYIC8gMiwgLSBzY2FsZVkgLyAyICk7XG4gICAgICAgIF9jb250ZXh0LnNjYWxlKCBjeCwgY3kgKTtcbiAgICAgICAgX2NvbnRleHQudHJhbnNsYXRlKCAtIG94LCAtIG95ICk7XG4gICAgICAgIF9jb250ZXh0LmZpbGxSZWN0KCBveCwgb3ksIHN4LCBzeSApO1xuICAgICAgICBfY29udGV4dC5yZXN0b3JlKCk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gbm8gdGV4dHVyZVxuXG4gICAgICAgIHNldEZpbGxTdHlsZSggbWF0ZXJpYWwuY29sb3IuZ2V0U3R5bGUoKSApO1xuXG4gICAgICAgIF9jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgX2NvbnRleHQudHJhbnNsYXRlKCB2MS54LCB2MS55ICk7XG4gICAgICAgIGlmICggbWF0ZXJpYWwucm90YXRpb24gIT09IDAgKSBfY29udGV4dC5yb3RhdGUoIG1hdGVyaWFsLnJvdGF0aW9uICk7XG4gICAgICAgIF9jb250ZXh0LnNjYWxlKCBzY2FsZVgsIC0gc2NhbGVZICk7XG4gICAgICAgIF9jb250ZXh0LmZpbGxSZWN0KCAtIDAuNSwgLSAwLjUsIDEsIDEgKTtcbiAgICAgICAgX2NvbnRleHQucmVzdG9yZSgpO1xuXG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKCBtYXRlcmlhbCBpbnN0YW5jZW9mIFRIUkVFLlNwcml0ZUNhbnZhc01hdGVyaWFsICkge1xuXG4gICAgICBzZXRTdHJva2VTdHlsZSggbWF0ZXJpYWwuY29sb3IuZ2V0U3R5bGUoKSApO1xuICAgICAgc2V0RmlsbFN0eWxlKCBtYXRlcmlhbC5jb2xvci5nZXRTdHlsZSgpICk7XG5cbiAgICAgIF9jb250ZXh0LnNhdmUoKTtcbiAgICAgIF9jb250ZXh0LnRyYW5zbGF0ZSggdjEueCwgdjEueSApO1xuICAgICAgaWYgKCBtYXRlcmlhbC5yb3RhdGlvbiAhPT0gMCApIF9jb250ZXh0LnJvdGF0ZSggbWF0ZXJpYWwucm90YXRpb24gKTtcbiAgICAgIF9jb250ZXh0LnNjYWxlKCBzY2FsZVgsIHNjYWxlWSApO1xuXG4gICAgICBtYXRlcmlhbC5wcm9ncmFtKCBfY29udGV4dCApO1xuXG4gICAgICBfY29udGV4dC5yZXN0b3JlKCk7XG5cbiAgICB9XG5cbiAgICAvKiBERUJVR1xuICAgIHNldFN0cm9rZVN0eWxlKCAncmdiKDI1NSwyNTUsMCknICk7XG4gICAgX2NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgX2NvbnRleHQubW92ZVRvKCB2MS54IC0gMTAsIHYxLnkgKTtcbiAgICBfY29udGV4dC5saW5lVG8oIHYxLnggKyAxMCwgdjEueSApO1xuICAgIF9jb250ZXh0Lm1vdmVUbyggdjEueCwgdjEueSAtIDEwICk7XG4gICAgX2NvbnRleHQubGluZVRvKCB2MS54LCB2MS55ICsgMTAgKTtcbiAgICBfY29udGV4dC5zdHJva2UoKTtcbiAgICAqL1xuXG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJMaW5lKCB2MSwgdjIsIGVsZW1lbnQsIG1hdGVyaWFsICkge1xuXG4gICAgc2V0T3BhY2l0eSggbWF0ZXJpYWwub3BhY2l0eSApO1xuICAgIHNldEJsZW5kaW5nKCBtYXRlcmlhbC5ibGVuZGluZyApO1xuXG4gICAgX2NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgX2NvbnRleHQubW92ZVRvKCB2MS5wb3NpdGlvblNjcmVlbi54LCB2MS5wb3NpdGlvblNjcmVlbi55ICk7XG4gICAgX2NvbnRleHQubGluZVRvKCB2Mi5wb3NpdGlvblNjcmVlbi54LCB2Mi5wb3NpdGlvblNjcmVlbi55ICk7XG5cbiAgICBpZiAoIG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwgKSB7XG5cbiAgICAgIHNldExpbmVXaWR0aCggbWF0ZXJpYWwubGluZXdpZHRoICk7XG4gICAgICBzZXRMaW5lQ2FwKCBtYXRlcmlhbC5saW5lY2FwICk7XG4gICAgICBzZXRMaW5lSm9pbiggbWF0ZXJpYWwubGluZWpvaW4gKTtcblxuICAgICAgaWYgKCBtYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgIT09IFRIUkVFLlZlcnRleENvbG9ycyApIHtcblxuICAgICAgICBzZXRTdHJva2VTdHlsZSggbWF0ZXJpYWwuY29sb3IuZ2V0U3R5bGUoKSApO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciBjb2xvclN0eWxlMSA9IGVsZW1lbnQudmVydGV4Q29sb3JzWyAwIF0uZ2V0U3R5bGUoKTtcbiAgICAgICAgdmFyIGNvbG9yU3R5bGUyID0gZWxlbWVudC52ZXJ0ZXhDb2xvcnNbIDEgXS5nZXRTdHlsZSgpO1xuXG4gICAgICAgIGlmICggY29sb3JTdHlsZTEgPT09IGNvbG9yU3R5bGUyICkge1xuXG4gICAgICAgICAgc2V0U3Ryb2tlU3R5bGUoIGNvbG9yU3R5bGUxICk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIHZhciBncmFkID0gX2NvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoXG4gICAgICAgICAgICAgIHYxLnBvc2l0aW9uU2NyZWVuLngsXG4gICAgICAgICAgICAgIHYxLnBvc2l0aW9uU2NyZWVuLnksXG4gICAgICAgICAgICAgIHYyLnBvc2l0aW9uU2NyZWVuLngsXG4gICAgICAgICAgICAgIHYyLnBvc2l0aW9uU2NyZWVuLnlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcCggMCwgY29sb3JTdHlsZTEgKTtcbiAgICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKCAxLCBjb2xvclN0eWxlMiApO1xuXG4gICAgICAgICAgfSBjYXRjaCAoIGV4Y2VwdGlvbiApIHtcblxuICAgICAgICAgICAgZ3JhZCA9IGNvbG9yU3R5bGUxO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2V0U3Ryb2tlU3R5bGUoIGdyYWQgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgX2NvbnRleHQuc3Ryb2tlKCk7XG4gICAgICBfZWxlbUJveC5leHBhbmRCeVNjYWxhciggbWF0ZXJpYWwubGluZXdpZHRoICogMiApO1xuXG4gICAgfSBlbHNlIGlmICggbWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5MaW5lRGFzaGVkTWF0ZXJpYWwgKSB7XG5cbiAgICAgIHNldExpbmVXaWR0aCggbWF0ZXJpYWwubGluZXdpZHRoICk7XG4gICAgICBzZXRMaW5lQ2FwKCBtYXRlcmlhbC5saW5lY2FwICk7XG4gICAgICBzZXRMaW5lSm9pbiggbWF0ZXJpYWwubGluZWpvaW4gKTtcbiAgICAgIHNldFN0cm9rZVN0eWxlKCBtYXRlcmlhbC5jb2xvci5nZXRTdHlsZSgpICk7XG4gICAgICBzZXRMaW5lRGFzaCggWyBtYXRlcmlhbC5kYXNoU2l6ZSwgbWF0ZXJpYWwuZ2FwU2l6ZSBdICk7XG5cbiAgICAgIF9jb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICBfZWxlbUJveC5leHBhbmRCeVNjYWxhciggbWF0ZXJpYWwubGluZXdpZHRoICogMiApO1xuXG4gICAgICBzZXRMaW5lRGFzaCggW10gKTtcblxuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyRmFjZTMoIHYxLCB2MiwgdjMsIHV2MSwgdXYyLCB1djMsIGVsZW1lbnQsIG1hdGVyaWFsICkge1xuXG4gICAgX3RoaXMuaW5mby5yZW5kZXIudmVydGljZXMgKz0gMztcbiAgICBfdGhpcy5pbmZvLnJlbmRlci5mYWNlcyArKztcblxuICAgIHNldE9wYWNpdHkoIG1hdGVyaWFsLm9wYWNpdHkgKTtcbiAgICBzZXRCbGVuZGluZyggbWF0ZXJpYWwuYmxlbmRpbmcgKTtcblxuICAgIF92MXggPSB2MS5wb3NpdGlvblNjcmVlbi54OyBfdjF5ID0gdjEucG9zaXRpb25TY3JlZW4ueTtcbiAgICBfdjJ4ID0gdjIucG9zaXRpb25TY3JlZW4ueDsgX3YyeSA9IHYyLnBvc2l0aW9uU2NyZWVuLnk7XG4gICAgX3YzeCA9IHYzLnBvc2l0aW9uU2NyZWVuLng7IF92M3kgPSB2My5wb3NpdGlvblNjcmVlbi55O1xuXG4gICAgZHJhd1RyaWFuZ2xlKCBfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5ICk7XG5cbiAgICBpZiAoICggbWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsIHx8IG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwgKSAmJiBtYXRlcmlhbC5tYXAgPT09IG51bGwgKSB7XG5cbiAgICAgIF9kaWZmdXNlQ29sb3IuY29weSggbWF0ZXJpYWwuY29sb3IgKTtcbiAgICAgIF9lbWlzc2l2ZUNvbG9yLmNvcHkoIG1hdGVyaWFsLmVtaXNzaXZlICk7XG5cbiAgICAgIGlmICggbWF0ZXJpYWwudmVydGV4Q29sb3JzID09PSBUSFJFRS5GYWNlQ29sb3JzICkge1xuXG4gICAgICAgIF9kaWZmdXNlQ29sb3IubXVsdGlwbHkoIGVsZW1lbnQuY29sb3IgKTtcblxuICAgICAgfVxuXG4gICAgICBfY29sb3IuY29weSggX2FtYmllbnRMaWdodCApO1xuXG4gICAgICBfY2VudHJvaWQuY29weSggdjEucG9zaXRpb25Xb3JsZCApLmFkZCggdjIucG9zaXRpb25Xb3JsZCApLmFkZCggdjMucG9zaXRpb25Xb3JsZCApLmRpdmlkZVNjYWxhciggMyApO1xuXG4gICAgICBjYWxjdWxhdGVMaWdodCggX2NlbnRyb2lkLCBlbGVtZW50Lm5vcm1hbE1vZGVsLCBfY29sb3IgKTtcblxuICAgICAgX2NvbG9yLm11bHRpcGx5KCBfZGlmZnVzZUNvbG9yICkuYWRkKCBfZW1pc3NpdmVDb2xvciApO1xuXG4gICAgICBtYXRlcmlhbC53aXJlZnJhbWUgPT09IHRydWVcbiAgICAgICAgID8gc3Ryb2tlUGF0aCggX2NvbG9yLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5ld2lkdGgsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVjYXAsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVqb2luIClcbiAgICAgICAgIDogZmlsbFBhdGgoIF9jb2xvciApO1xuXG4gICAgfSBlbHNlIGlmICggbWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCB8fFxuICAgICAgICAgICAgbWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsIHx8XG4gICAgICAgICAgICBtYXRlcmlhbCBpbnN0YW5jZW9mIFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsICkge1xuXG4gICAgICBpZiAoIG1hdGVyaWFsLm1hcCAhPT0gbnVsbCApIHtcblxuICAgICAgICB2YXIgbWFwcGluZyA9IG1hdGVyaWFsLm1hcC5tYXBwaW5nO1xuXG4gICAgICAgIGlmICggbWFwcGluZyA9PT0gVEhSRUUuVVZNYXBwaW5nICkge1xuXG4gICAgICAgICAgX3V2cyA9IGVsZW1lbnQudXZzO1xuICAgICAgICAgIHBhdHRlcm5QYXRoKCBfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5LCBfdXZzWyB1djEgXS54LCBfdXZzWyB1djEgXS55LCBfdXZzWyB1djIgXS54LCBfdXZzWyB1djIgXS55LCBfdXZzWyB1djMgXS54LCBfdXZzWyB1djMgXS55LCBtYXRlcmlhbC5tYXAgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoIG1hdGVyaWFsLmVudk1hcCAhPT0gbnVsbCApIHtcblxuICAgICAgICBpZiAoIG1hdGVyaWFsLmVudk1hcC5tYXBwaW5nID09PSBUSFJFRS5TcGhlcmljYWxSZWZsZWN0aW9uTWFwcGluZyApIHtcblxuICAgICAgICAgIF9ub3JtYWwuY29weSggZWxlbWVudC52ZXJ0ZXhOb3JtYWxzTW9kZWxbIHV2MSBdICkuYXBwbHlNYXRyaXgzKCBfbm9ybWFsVmlld01hdHJpeCApO1xuICAgICAgICAgIF91djF4ID0gMC41ICogX25vcm1hbC54ICsgMC41O1xuICAgICAgICAgIF91djF5ID0gMC41ICogX25vcm1hbC55ICsgMC41O1xuXG4gICAgICAgICAgX25vcm1hbC5jb3B5KCBlbGVtZW50LnZlcnRleE5vcm1hbHNNb2RlbFsgdXYyIF0gKS5hcHBseU1hdHJpeDMoIF9ub3JtYWxWaWV3TWF0cml4ICk7XG4gICAgICAgICAgX3V2MnggPSAwLjUgKiBfbm9ybWFsLnggKyAwLjU7XG4gICAgICAgICAgX3V2MnkgPSAwLjUgKiBfbm9ybWFsLnkgKyAwLjU7XG5cbiAgICAgICAgICBfbm9ybWFsLmNvcHkoIGVsZW1lbnQudmVydGV4Tm9ybWFsc01vZGVsWyB1djMgXSApLmFwcGx5TWF0cml4MyggX25vcm1hbFZpZXdNYXRyaXggKTtcbiAgICAgICAgICBfdXYzeCA9IDAuNSAqIF9ub3JtYWwueCArIDAuNTtcbiAgICAgICAgICBfdXYzeSA9IDAuNSAqIF9ub3JtYWwueSArIDAuNTtcblxuICAgICAgICAgIHBhdHRlcm5QYXRoKCBfdjF4LCBfdjF5LCBfdjJ4LCBfdjJ5LCBfdjN4LCBfdjN5LCBfdXYxeCwgX3V2MXksIF91djJ4LCBfdXYyeSwgX3V2M3gsIF91djN5LCBtYXRlcmlhbC5lbnZNYXAgKTtcblxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgX2NvbG9yLmNvcHkoIG1hdGVyaWFsLmNvbG9yICk7XG5cbiAgICAgICAgaWYgKCBtYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgPT09IFRIUkVFLkZhY2VDb2xvcnMgKSB7XG5cbiAgICAgICAgICBfY29sb3IubXVsdGlwbHkoIGVsZW1lbnQuY29sb3IgKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgbWF0ZXJpYWwud2lyZWZyYW1lID09PSB0cnVlXG4gICAgICAgICAgID8gc3Ryb2tlUGF0aCggX2NvbG9yLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5ld2lkdGgsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVjYXAsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmVqb2luIClcbiAgICAgICAgICAgOiBmaWxsUGF0aCggX2NvbG9yICk7XG5cbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoIG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTWVzaERlcHRoTWF0ZXJpYWwgKSB7XG5cbiAgICAgIF9jb2xvci5yID0gX2NvbG9yLmcgPSBfY29sb3IuYiA9IDEgLSBzbW9vdGhzdGVwKCB2MS5wb3NpdGlvblNjcmVlbi56ICogdjEucG9zaXRpb25TY3JlZW4udywgX2NhbWVyYS5uZWFyLCBfY2FtZXJhLmZhciApO1xuXG4gICAgICBtYXRlcmlhbC53aXJlZnJhbWUgPT09IHRydWVcbiAgICAgICAgICAgPyBzdHJva2VQYXRoKCBfY29sb3IsIG1hdGVyaWFsLndpcmVmcmFtZUxpbmV3aWR0aCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWNhcCwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZWpvaW4gKVxuICAgICAgICAgICA6IGZpbGxQYXRoKCBfY29sb3IgKTtcblxuICAgIH0gZWxzZSBpZiAoIG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsICkge1xuXG4gICAgICBfbm9ybWFsLmNvcHkoIGVsZW1lbnQubm9ybWFsTW9kZWwgKS5hcHBseU1hdHJpeDMoIF9ub3JtYWxWaWV3TWF0cml4ICk7XG5cbiAgICAgIF9jb2xvci5zZXRSR0IoIF9ub3JtYWwueCwgX25vcm1hbC55LCBfbm9ybWFsLnogKS5tdWx0aXBseVNjYWxhciggMC41ICkuYWRkU2NhbGFyKCAwLjUgKTtcblxuICAgICAgbWF0ZXJpYWwud2lyZWZyYW1lID09PSB0cnVlXG4gICAgICAgICA/IHN0cm9rZVBhdGgoIF9jb2xvciwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZXdpZHRoLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5lY2FwLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5lam9pbiApXG4gICAgICAgICA6IGZpbGxQYXRoKCBfY29sb3IgKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIF9jb2xvci5zZXRSR0IoIDEsIDEsIDEgKTtcblxuICAgICAgbWF0ZXJpYWwud2lyZWZyYW1lID09PSB0cnVlXG4gICAgICAgICA/IHN0cm9rZVBhdGgoIF9jb2xvciwgbWF0ZXJpYWwud2lyZWZyYW1lTGluZXdpZHRoLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5lY2FwLCBtYXRlcmlhbC53aXJlZnJhbWVMaW5lam9pbiApXG4gICAgICAgICA6IGZpbGxQYXRoKCBfY29sb3IgKTtcblxuICAgIH1cblxuICB9XG5cbiAgLy9cblxuICBmdW5jdGlvbiBkcmF3VHJpYW5nbGUoIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIgKSB7XG5cbiAgICBfY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBfY29udGV4dC5tb3ZlVG8oIHgwLCB5MCApO1xuICAgIF9jb250ZXh0LmxpbmVUbyggeDEsIHkxICk7XG4gICAgX2NvbnRleHQubGluZVRvKCB4MiwgeTIgKTtcbiAgICBfY29udGV4dC5jbG9zZVBhdGgoKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gc3Ryb2tlUGF0aCggY29sb3IsIGxpbmV3aWR0aCwgbGluZWNhcCwgbGluZWpvaW4gKSB7XG5cbiAgICBzZXRMaW5lV2lkdGgoIGxpbmV3aWR0aCApO1xuICAgIHNldExpbmVDYXAoIGxpbmVjYXAgKTtcbiAgICBzZXRMaW5lSm9pbiggbGluZWpvaW4gKTtcbiAgICBzZXRTdHJva2VTdHlsZSggY29sb3IuZ2V0U3R5bGUoKSApO1xuXG4gICAgX2NvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICBfZWxlbUJveC5leHBhbmRCeVNjYWxhciggbGluZXdpZHRoICogMiApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBmaWxsUGF0aCggY29sb3IgKSB7XG5cbiAgICBzZXRGaWxsU3R5bGUoIGNvbG9yLmdldFN0eWxlKCkgKTtcbiAgICBfY29udGV4dC5maWxsKCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVGV4dHVyZVVwZGF0ZSAoIGV2ZW50ICkge1xuXG4gICAgdGV4dHVyZVRvUGF0dGVybiggZXZlbnQudGFyZ2V0ICk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHRleHR1cmVUb1BhdHRlcm4oIHRleHR1cmUgKSB7XG5cbiAgICBpZiAoIHRleHR1cmUgaW5zdGFuY2VvZiBUSFJFRS5Db21wcmVzc2VkVGV4dHVyZSApIHJldHVybjtcblxuICAgIHZhciByZXBlYXRYID0gdGV4dHVyZS53cmFwUyA9PT0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgdmFyIHJlcGVhdFkgPSB0ZXh0dXJlLndyYXBUID09PSBUSFJFRS5SZXBlYXRXcmFwcGluZztcblxuICAgIHZhciBpbWFnZSA9IHRleHR1cmUuaW1hZ2U7XG5cbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCAxLCAwLCAwLCAtIDEsIDAsIGltYWdlLmhlaWdodCApO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKCBpbWFnZSwgMCwgMCApO1xuXG4gICAgX3BhdHRlcm5zWyB0ZXh0dXJlLmlkIF0gPSBfY29udGV4dC5jcmVhdGVQYXR0ZXJuKFxuICAgICAgY2FudmFzLCByZXBlYXRYID09PSB0cnVlICYmIHJlcGVhdFkgPT09IHRydWVcbiAgICAgICAgID8gJ3JlcGVhdCdcbiAgICAgICAgIDogcmVwZWF0WCA9PT0gdHJ1ZSAmJiByZXBlYXRZID09PSBmYWxzZVxuICAgICAgICAgICA/ICdyZXBlYXQteCdcbiAgICAgICAgICAgOiByZXBlYXRYID09PSBmYWxzZSAmJiByZXBlYXRZID09PSB0cnVlXG4gICAgICAgICAgICAgPyAncmVwZWF0LXknXG4gICAgICAgICAgICAgOiAnbm8tcmVwZWF0J1xuICAgICk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdHRlcm5QYXRoKCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCB1MCwgdjAsIHUxLCB2MSwgdTIsIHYyLCB0ZXh0dXJlICkge1xuXG4gICAgaWYgKCB0ZXh0dXJlIGluc3RhbmNlb2YgVEhSRUUuRGF0YVRleHR1cmUgKSByZXR1cm47XG5cbiAgICBpZiAoIHRleHR1cmUuaGFzRXZlbnRMaXN0ZW5lciggJ3VwZGF0ZScsIG9uVGV4dHVyZVVwZGF0ZSApID09PSBmYWxzZSApIHtcblxuICAgICAgaWYgKCB0ZXh0dXJlLmltYWdlICE9PSB1bmRlZmluZWQgJiYgdGV4dHVyZS5pbWFnZS53aWR0aCA+IDAgKSB7XG5cbiAgICAgICAgdGV4dHVyZVRvUGF0dGVybiggdGV4dHVyZSApO1xuXG4gICAgICB9XG5cbiAgICAgIHRleHR1cmUuYWRkRXZlbnRMaXN0ZW5lciggJ3VwZGF0ZScsIG9uVGV4dHVyZVVwZGF0ZSApO1xuXG4gICAgfVxuXG4gICAgdmFyIHBhdHRlcm4gPSBfcGF0dGVybnNbIHRleHR1cmUuaWQgXTtcblxuICAgIGlmICggcGF0dGVybiAhPT0gdW5kZWZpbmVkICkge1xuXG4gICAgICBzZXRGaWxsU3R5bGUoIHBhdHRlcm4gKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHNldEZpbGxTdHlsZSggJ3JnYmEoMCwwLDAsMSknICk7XG4gICAgICBfY29udGV4dC5maWxsKCk7XG5cbiAgICAgIHJldHVybjtcblxuICAgIH1cblxuICAgIC8vIGh0dHA6Ly9leHRyZW1lbHlzYXRpc2ZhY3Rvcnl0b3RhbGl0YXJpYW5pc20uY29tL2Jsb2cvP3A9MjEyMFxuXG4gICAgdmFyIGEsIGIsIGMsIGQsIGUsIGYsIGRldCwgaWRldCxcbiAgICBvZmZzZXRYID0gdGV4dHVyZS5vZmZzZXQueCAvIHRleHR1cmUucmVwZWF0LngsXG4gICAgb2Zmc2V0WSA9IHRleHR1cmUub2Zmc2V0LnkgLyB0ZXh0dXJlLnJlcGVhdC55LFxuICAgIHdpZHRoID0gdGV4dHVyZS5pbWFnZS53aWR0aCAqIHRleHR1cmUucmVwZWF0LngsXG4gICAgaGVpZ2h0ID0gdGV4dHVyZS5pbWFnZS5oZWlnaHQgKiB0ZXh0dXJlLnJlcGVhdC55O1xuXG4gICAgdTAgPSAoIHUwICsgb2Zmc2V0WCApICogd2lkdGg7XG4gICAgdjAgPSAoIHYwICsgb2Zmc2V0WSApICogaGVpZ2h0O1xuXG4gICAgdTEgPSAoIHUxICsgb2Zmc2V0WCApICogd2lkdGg7XG4gICAgdjEgPSAoIHYxICsgb2Zmc2V0WSApICogaGVpZ2h0O1xuXG4gICAgdTIgPSAoIHUyICsgb2Zmc2V0WCApICogd2lkdGg7XG4gICAgdjIgPSAoIHYyICsgb2Zmc2V0WSApICogaGVpZ2h0O1xuXG4gICAgeDEgLT0geDA7IHkxIC09IHkwO1xuICAgIHgyIC09IHgwOyB5MiAtPSB5MDtcblxuICAgIHUxIC09IHUwOyB2MSAtPSB2MDtcbiAgICB1MiAtPSB1MDsgdjIgLT0gdjA7XG5cbiAgICBkZXQgPSB1MSAqIHYyIC0gdTIgKiB2MTtcblxuICAgIGlmICggZGV0ID09PSAwICkgcmV0dXJuO1xuXG4gICAgaWRldCA9IDEgLyBkZXQ7XG5cbiAgICBhID0gKCB2MiAqIHgxIC0gdjEgKiB4MiApICogaWRldDtcbiAgICBiID0gKCB2MiAqIHkxIC0gdjEgKiB5MiApICogaWRldDtcbiAgICBjID0gKCB1MSAqIHgyIC0gdTIgKiB4MSApICogaWRldDtcbiAgICBkID0gKCB1MSAqIHkyIC0gdTIgKiB5MSApICogaWRldDtcblxuICAgIGUgPSB4MCAtIGEgKiB1MCAtIGMgKiB2MDtcbiAgICBmID0geTAgLSBiICogdTAgLSBkICogdjA7XG5cbiAgICBfY29udGV4dC5zYXZlKCk7XG4gICAgX2NvbnRleHQudHJhbnNmb3JtKCBhLCBiLCBjLCBkLCBlLCBmICk7XG4gICAgX2NvbnRleHQuZmlsbCgpO1xuICAgIF9jb250ZXh0LnJlc3RvcmUoKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gY2xpcEltYWdlKCB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCB1MCwgdjAsIHUxLCB2MSwgdTIsIHYyLCBpbWFnZSApIHtcblxuICAgIC8vIGh0dHA6Ly9leHRyZW1lbHlzYXRpc2ZhY3Rvcnl0b3RhbGl0YXJpYW5pc20uY29tL2Jsb2cvP3A9MjEyMFxuXG4gICAgdmFyIGEsIGIsIGMsIGQsIGUsIGYsIGRldCwgaWRldCxcbiAgICB3aWR0aCA9IGltYWdlLndpZHRoIC0gMSxcbiAgICBoZWlnaHQgPSBpbWFnZS5oZWlnaHQgLSAxO1xuXG4gICAgdTAgKj0gd2lkdGg7IHYwICo9IGhlaWdodDtcbiAgICB1MSAqPSB3aWR0aDsgdjEgKj0gaGVpZ2h0O1xuICAgIHUyICo9IHdpZHRoOyB2MiAqPSBoZWlnaHQ7XG5cbiAgICB4MSAtPSB4MDsgeTEgLT0geTA7XG4gICAgeDIgLT0geDA7IHkyIC09IHkwO1xuXG4gICAgdTEgLT0gdTA7IHYxIC09IHYwO1xuICAgIHUyIC09IHUwOyB2MiAtPSB2MDtcblxuICAgIGRldCA9IHUxICogdjIgLSB1MiAqIHYxO1xuXG4gICAgaWRldCA9IDEgLyBkZXQ7XG5cbiAgICBhID0gKCB2MiAqIHgxIC0gdjEgKiB4MiApICogaWRldDtcbiAgICBiID0gKCB2MiAqIHkxIC0gdjEgKiB5MiApICogaWRldDtcbiAgICBjID0gKCB1MSAqIHgyIC0gdTIgKiB4MSApICogaWRldDtcbiAgICBkID0gKCB1MSAqIHkyIC0gdTIgKiB5MSApICogaWRldDtcblxuICAgIGUgPSB4MCAtIGEgKiB1MCAtIGMgKiB2MDtcbiAgICBmID0geTAgLSBiICogdTAgLSBkICogdjA7XG5cbiAgICBfY29udGV4dC5zYXZlKCk7XG4gICAgX2NvbnRleHQudHJhbnNmb3JtKCBhLCBiLCBjLCBkLCBlLCBmICk7XG4gICAgX2NvbnRleHQuY2xpcCgpO1xuICAgIF9jb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIDAgKTtcbiAgICBfY29udGV4dC5yZXN0b3JlKCk7XG5cbiAgfVxuXG4gIC8vIEhpZGUgYW50aS1hbGlhcyBnYXBzXG5cbiAgZnVuY3Rpb24gZXhwYW5kKCB2MSwgdjIsIHBpeGVscyApIHtcblxuICAgIHZhciB4ID0gdjIueCAtIHYxLngsIHkgPSB2Mi55IC0gdjEueSxcbiAgICBkZXQgPSB4ICogeCArIHkgKiB5LCBpZGV0O1xuXG4gICAgaWYgKCBkZXQgPT09IDAgKSByZXR1cm47XG5cbiAgICBpZGV0ID0gcGl4ZWxzIC8gTWF0aC5zcXJ0KCBkZXQgKTtcblxuICAgIHggKj0gaWRldDsgeSAqPSBpZGV0O1xuXG4gICAgdjIueCArPSB4OyB2Mi55ICs9IHk7XG4gICAgdjEueCAtPSB4OyB2MS55IC09IHk7XG5cbiAgfVxuXG4gIC8vIENvbnRleHQgY2FjaGVkIG1ldGhvZHMuXG5cbiAgZnVuY3Rpb24gc2V0T3BhY2l0eSggdmFsdWUgKSB7XG5cbiAgICBpZiAoIF9jb250ZXh0R2xvYmFsQWxwaGEgIT09IHZhbHVlICkge1xuXG4gICAgICBfY29udGV4dC5nbG9iYWxBbHBoYSA9IHZhbHVlO1xuICAgICAgX2NvbnRleHRHbG9iYWxBbHBoYSA9IHZhbHVlO1xuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBzZXRCbGVuZGluZyggdmFsdWUgKSB7XG5cbiAgICBpZiAoIF9jb250ZXh0R2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uICE9PSB2YWx1ZSApIHtcblxuICAgICAgaWYgKCB2YWx1ZSA9PT0gVEhSRUUuTm9ybWFsQmxlbmRpbmcgKSB7XG5cbiAgICAgICAgX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcblxuICAgICAgfSBlbHNlIGlmICggdmFsdWUgPT09IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcgKSB7XG5cbiAgICAgICAgX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2xpZ2h0ZXInO1xuXG4gICAgICB9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gVEhSRUUuU3VidHJhY3RpdmVCbGVuZGluZyApIHtcblxuICAgICAgICBfY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGFya2VyJztcblxuICAgICAgfVxuXG4gICAgICBfY29udGV4dEdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHZhbHVlO1xuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBzZXRMaW5lV2lkdGgoIHZhbHVlICkge1xuXG4gICAgaWYgKCBfY29udGV4dExpbmVXaWR0aCAhPT0gdmFsdWUgKSB7XG5cbiAgICAgIF9jb250ZXh0LmxpbmVXaWR0aCA9IHZhbHVlO1xuICAgICAgX2NvbnRleHRMaW5lV2lkdGggPSB2YWx1ZTtcblxuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gc2V0TGluZUNhcCggdmFsdWUgKSB7XG5cbiAgICAvLyBcImJ1dHRcIiwgXCJyb3VuZFwiLCBcInNxdWFyZVwiXG5cbiAgICBpZiAoIF9jb250ZXh0TGluZUNhcCAhPT0gdmFsdWUgKSB7XG5cbiAgICAgIF9jb250ZXh0LmxpbmVDYXAgPSB2YWx1ZTtcbiAgICAgIF9jb250ZXh0TGluZUNhcCA9IHZhbHVlO1xuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBzZXRMaW5lSm9pbiggdmFsdWUgKSB7XG5cbiAgICAvLyBcInJvdW5kXCIsIFwiYmV2ZWxcIiwgXCJtaXRlclwiXG5cbiAgICBpZiAoIF9jb250ZXh0TGluZUpvaW4gIT09IHZhbHVlICkge1xuXG4gICAgICBfY29udGV4dC5saW5lSm9pbiA9IHZhbHVlO1xuICAgICAgX2NvbnRleHRMaW5lSm9pbiA9IHZhbHVlO1xuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBzZXRTdHJva2VTdHlsZSggdmFsdWUgKSB7XG5cbiAgICBpZiAoIF9jb250ZXh0U3Ryb2tlU3R5bGUgIT09IHZhbHVlICkge1xuXG4gICAgICBfY29udGV4dC5zdHJva2VTdHlsZSA9IHZhbHVlO1xuICAgICAgX2NvbnRleHRTdHJva2VTdHlsZSA9IHZhbHVlO1xuXG4gICAgfVxuXG4gIH1cblxuICBmdW5jdGlvbiBzZXRGaWxsU3R5bGUoIHZhbHVlICkge1xuXG4gICAgaWYgKCBfY29udGV4dEZpbGxTdHlsZSAhPT0gdmFsdWUgKSB7XG5cbiAgICAgIF9jb250ZXh0LmZpbGxTdHlsZSA9IHZhbHVlO1xuICAgICAgX2NvbnRleHRGaWxsU3R5bGUgPSB2YWx1ZTtcblxuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gc2V0TGluZURhc2goIHZhbHVlICkge1xuXG4gICAgaWYgKCBfY29udGV4dExpbmVEYXNoLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoICkge1xuXG4gICAgICBfY29udGV4dC5zZXRMaW5lRGFzaCggdmFsdWUgKTtcbiAgICAgIF9jb250ZXh0TGluZURhc2ggPSB2YWx1ZTtcblxuICAgIH1cblxuICB9XG5cbn07Il0sIm5hbWVzIjpbIlRIUkVFIiwiU3ByaXRlQ2FudmFzTWF0ZXJpYWwiLCJwYXJhbWV0ZXJzIiwiTWF0ZXJpYWwiLCJjYWxsIiwidHlwZSIsImNvbG9yIiwiQ29sb3IiLCJwcm9ncmFtIiwiY29udGV4dCIsInNldFZhbHVlcyIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiY2xvbmUiLCJtYXRlcmlhbCIsImNvcHkiLCJDYW52YXNSZW5kZXJlciIsImNvbnNvbGUiLCJsb2ciLCJSRVZJU0lPTiIsInNtb290aHN0ZXAiLCJNYXRoIiwiX3RoaXMiLCJfcmVuZGVyRGF0YSIsIl9lbGVtZW50cyIsIl9saWdodHMiLCJfcHJvamVjdG9yIiwiUHJvamVjdG9yIiwiX2NhbnZhcyIsImNhbnZhcyIsInVuZGVmaW5lZCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIl9jYW52YXNXaWR0aCIsIndpZHRoIiwiX2NhbnZhc0hlaWdodCIsImhlaWdodCIsIl9jYW52YXNXaWR0aEhhbGYiLCJmbG9vciIsIl9jYW52YXNIZWlnaHRIYWxmIiwiX3ZpZXdwb3J0WCIsIl92aWV3cG9ydFkiLCJfdmlld3BvcnRXaWR0aCIsIl92aWV3cG9ydEhlaWdodCIsInBpeGVsUmF0aW8iLCJfY29udGV4dCIsImdldENvbnRleHQiLCJhbHBoYSIsIl9jbGVhckNvbG9yIiwiX2NsZWFyQWxwaGEiLCJfY29udGV4dEdsb2JhbEFscGhhIiwiX2NvbnRleHRHbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJfY29udGV4dFN0cm9rZVN0eWxlIiwiX2NvbnRleHRGaWxsU3R5bGUiLCJfY29udGV4dExpbmVXaWR0aCIsIl9jb250ZXh0TGluZUNhcCIsIl9jb250ZXh0TGluZUpvaW4iLCJfY29udGV4dExpbmVEYXNoIiwiX2NhbWVyYSIsIl92MSIsIl92MiIsIl92MyIsIl92NCIsIl92NSIsIlJlbmRlcmFibGVWZXJ0ZXgiLCJfdjYiLCJfdjF4IiwiX3YxeSIsIl92MngiLCJfdjJ5IiwiX3YzeCIsIl92M3kiLCJfdjR4IiwiX3Y0eSIsIl92NXgiLCJfdjV5IiwiX3Y2eCIsIl92NnkiLCJfY29sb3IiLCJfY29sb3IxIiwiX2NvbG9yMiIsIl9jb2xvcjMiLCJfY29sb3I0IiwiX2RpZmZ1c2VDb2xvciIsIl9lbWlzc2l2ZUNvbG9yIiwiX2xpZ2h0Q29sb3IiLCJfcGF0dGVybnMiLCJfaW1hZ2UiLCJfdXZzIiwiX3V2MXgiLCJfdXYxeSIsIl91djJ4IiwiX3V2MnkiLCJfdXYzeCIsIl91djN5IiwiX2NsaXBCb3giLCJCb3gyIiwiX2NsZWFyQm94IiwiX2VsZW1Cb3giLCJfYW1iaWVudExpZ2h0IiwiX2RpcmVjdGlvbmFsTGlnaHRzIiwiX3BvaW50TGlnaHRzIiwiX3ZlY3RvcjMiLCJWZWN0b3IzIiwiX2NlbnRyb2lkIiwiX25vcm1hbCIsIl9ub3JtYWxWaWV3TWF0cml4IiwiTWF0cml4MyIsInNldExpbmVEYXNoIiwiZG9tRWxlbWVudCIsImF1dG9DbGVhciIsInNvcnRPYmplY3RzIiwic29ydEVsZW1lbnRzIiwiaW5mbyIsInJlbmRlciIsInZlcnRpY2VzIiwiZmFjZXMiLCJzdXBwb3J0c1ZlcnRleFRleHR1cmVzIiwic2V0RmFjZUN1bGxpbmciLCJnZXRQaXhlbFJhdGlvIiwic2V0UGl4ZWxSYXRpbyIsInZhbHVlIiwic2V0U2l6ZSIsInVwZGF0ZVN0eWxlIiwic3R5bGUiLCJtaW4iLCJzZXQiLCJtYXgiLCJzZXRWaWV3cG9ydCIsIngiLCJ5Iiwic2V0U2Npc3NvciIsImVuYWJsZVNjaXNzb3JUZXN0Iiwic2V0Q2xlYXJDb2xvciIsInNldENsZWFyQ29sb3JIZXgiLCJoZXgiLCJ3YXJuIiwiZ2V0Q2xlYXJDb2xvciIsImdldENsZWFyQWxwaGEiLCJnZXRNYXhBbmlzb3Ryb3B5IiwiY2xlYXIiLCJlbXB0eSIsImludGVyc2VjdCIsImV4cGFuZEJ5U2NhbGFyIiwiY2xlYXJSZWN0Iiwic2V0QmxlbmRpbmciLCJOb3JtYWxCbGVuZGluZyIsInNldE9wYWNpdHkiLCJzZXRGaWxsU3R5bGUiLCJyIiwiZyIsImIiLCJmaWxsUmVjdCIsIm1ha2VFbXB0eSIsImNsZWFyQ29sb3IiLCJjbGVhckRlcHRoIiwiY2xlYXJTdGVuY2lsIiwic2NlbmUiLCJjYW1lcmEiLCJDYW1lcmEiLCJlcnJvciIsInNldFRyYW5zZm9ybSIsInRyYW5zbGF0ZSIsInByb2plY3RTY2VuZSIsImVsZW1lbnRzIiwibGlnaHRzIiwiZ2V0Tm9ybWFsTWF0cml4IiwibWF0cml4V29ybGRJbnZlcnNlIiwiY2FsY3VsYXRlTGlnaHRzIiwiZSIsImVsIiwibGVuZ3RoIiwiZWxlbWVudCIsIm9wYWNpdHkiLCJSZW5kZXJhYmxlU3ByaXRlIiwicmVuZGVyU3ByaXRlIiwiUmVuZGVyYWJsZUxpbmUiLCJ2MSIsInYyIiwicG9zaXRpb25TY3JlZW4iLCJzZXRGcm9tUG9pbnRzIiwiaXNJbnRlcnNlY3Rpb25Cb3giLCJyZW5kZXJMaW5lIiwiUmVuZGVyYWJsZUZhY2UiLCJ2MyIsInoiLCJvdmVyZHJhdyIsImV4cGFuZCIsInJlbmRlckZhY2UzIiwidW5pb24iLCJzZXRSR0IiLCJsIiwibGwiLCJsaWdodCIsImxpZ2h0Q29sb3IiLCJBbWJpZW50TGlnaHQiLCJhZGQiLCJEaXJlY3Rpb25hbExpZ2h0IiwiUG9pbnRMaWdodCIsImNhbGN1bGF0ZUxpZ2h0IiwicG9zaXRpb24iLCJub3JtYWwiLCJsaWdodFBvc2l0aW9uIiwic2V0RnJvbU1hdHJpeFBvc2l0aW9uIiwibWF0cml4V29ybGQiLCJub3JtYWxpemUiLCJhbW91bnQiLCJkb3QiLCJpbnRlbnNpdHkiLCJtdWx0aXBseVNjYWxhciIsInN1YlZlY3RvcnMiLCJkaXN0YW5jZSIsImRpc3RhbmNlVG8iLCJibGVuZGluZyIsInNjYWxlWCIsInNjYWxlIiwic2NhbGVZIiwiZGlzdCIsInNxcnQiLCJTcHJpdGVNYXRlcmlhbCIsInRleHR1cmUiLCJtYXAiLCJpbWFnZSIsImhhc0V2ZW50TGlzdGVuZXIiLCJvblRleHR1cmVVcGRhdGUiLCJ0ZXh0dXJlVG9QYXR0ZXJuIiwiYWRkRXZlbnRMaXN0ZW5lciIsInBhdHRlcm4iLCJpZCIsImJpdG1hcCIsIm94Iiwib2Zmc2V0Iiwib3kiLCJzeCIsInJlcGVhdCIsInN5IiwiY3giLCJjeSIsInNhdmUiLCJyb3RhdGlvbiIsInJvdGF0ZSIsInJlc3RvcmUiLCJnZXRTdHlsZSIsInNldFN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwiTGluZUJhc2ljTWF0ZXJpYWwiLCJzZXRMaW5lV2lkdGgiLCJsaW5ld2lkdGgiLCJzZXRMaW5lQ2FwIiwibGluZWNhcCIsInNldExpbmVKb2luIiwibGluZWpvaW4iLCJ2ZXJ0ZXhDb2xvcnMiLCJWZXJ0ZXhDb2xvcnMiLCJjb2xvclN0eWxlMSIsImNvbG9yU3R5bGUyIiwiZ3JhZCIsImNyZWF0ZUxpbmVhckdyYWRpZW50IiwiYWRkQ29sb3JTdG9wIiwiZXhjZXB0aW9uIiwic3Ryb2tlIiwiTGluZURhc2hlZE1hdGVyaWFsIiwiZGFzaFNpemUiLCJnYXBTaXplIiwidXYxIiwidXYyIiwidXYzIiwiZHJhd1RyaWFuZ2xlIiwiTWVzaExhbWJlcnRNYXRlcmlhbCIsIk1lc2hQaG9uZ01hdGVyaWFsIiwiZW1pc3NpdmUiLCJGYWNlQ29sb3JzIiwibXVsdGlwbHkiLCJwb3NpdGlvbldvcmxkIiwiZGl2aWRlU2NhbGFyIiwibm9ybWFsTW9kZWwiLCJ3aXJlZnJhbWUiLCJzdHJva2VQYXRoIiwid2lyZWZyYW1lTGluZXdpZHRoIiwid2lyZWZyYW1lTGluZWNhcCIsIndpcmVmcmFtZUxpbmVqb2luIiwiZmlsbFBhdGgiLCJNZXNoQmFzaWNNYXRlcmlhbCIsIm1hcHBpbmciLCJVVk1hcHBpbmciLCJ1dnMiLCJwYXR0ZXJuUGF0aCIsImVudk1hcCIsIlNwaGVyaWNhbFJlZmxlY3Rpb25NYXBwaW5nIiwidmVydGV4Tm9ybWFsc01vZGVsIiwiYXBwbHlNYXRyaXgzIiwiTWVzaERlcHRoTWF0ZXJpYWwiLCJ3IiwibmVhciIsImZhciIsIk1lc2hOb3JtYWxNYXRlcmlhbCIsImFkZFNjYWxhciIsIngwIiwieTAiLCJ4MSIsInkxIiwieDIiLCJ5MiIsImNsb3NlUGF0aCIsImZpbGwiLCJldmVudCIsInRhcmdldCIsIkNvbXByZXNzZWRUZXh0dXJlIiwicmVwZWF0WCIsIndyYXBTIiwiUmVwZWF0V3JhcHBpbmciLCJyZXBlYXRZIiwid3JhcFQiLCJkcmF3SW1hZ2UiLCJjcmVhdGVQYXR0ZXJuIiwidTAiLCJ2MCIsInUxIiwidTIiLCJEYXRhVGV4dHVyZSIsImEiLCJjIiwiZCIsImYiLCJkZXQiLCJpZGV0Iiwib2Zmc2V0WCIsIm9mZnNldFkiLCJ0cmFuc2Zvcm0iLCJjbGlwSW1hZ2UiLCJjbGlwIiwicGl4ZWxzIiwiZ2xvYmFsQWxwaGEiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJBZGRpdGl2ZUJsZW5kaW5nIiwiU3VidHJhY3RpdmVCbGVuZGluZyIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsInN0cm9rZVN0eWxlIiwiZmlsbFN0eWxlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Q0FFQyxHQUVEQSxNQUFNQyxvQkFBb0IsR0FBRyxTQUFXQyxVQUFVO0lBRWhERixNQUFNRyxRQUFRLENBQUNDLElBQUksQ0FBRSxJQUFJO0lBRXpCLElBQUksQ0FBQ0MsSUFBSSxHQUFHO0lBRVosSUFBSSxDQUFDQyxLQUFLLEdBQUcsSUFBSU4sTUFBTU8sS0FBSyxDQUFFO0lBQzlCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLFNBQVdDLE9BQU8sRUFBRUgsS0FBSyxHQUFJO0lBRTVDLElBQUksQ0FBQ0ksU0FBUyxDQUFFUjtBQUVsQjtBQUVBRixNQUFNQyxvQkFBb0IsQ0FBQ1UsU0FBUyxHQUFHQyxPQUFPQyxNQUFNLENBQUViLE1BQU1HLFFBQVEsQ0FBQ1EsU0FBUztBQUM5RVgsTUFBTUMsb0JBQW9CLENBQUNVLFNBQVMsQ0FBQ0csV0FBVyxHQUFHZCxNQUFNQyxvQkFBb0I7QUFFN0VELE1BQU1D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