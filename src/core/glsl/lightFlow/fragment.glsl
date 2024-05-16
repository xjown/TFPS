	precision highp float;
		varying vec2 vUv;
		uniform float iTime;

		float rand(vec2 co){
			return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}
		
		float hermite(float t)
		{
		  return t * t * (3.0 - 2.0 * t);
		}
		
		float noise(vec2 co, float frequency)
		{
		  vec2 v = vec2(co.x * frequency, co.y * frequency);
		
		  float ix1 = floor(v.x);
		  float iy1 = floor(v.y);
		  float ix2 = floor(v.x + 1.0);
		  float iy2 = floor(v.y + 1.0);
		
		  float fx = hermite(fract(v.x));
		  float fy = hermite(fract(v.y));
		
		  float fade1 = mix(rand(vec2(ix1, iy1)), rand(vec2(ix2, iy1)), fx);
		  float fade2 = mix(rand(vec2(ix1, iy2)), rand(vec2(ix2, iy2)), fx);
		
		  return mix(fade1, fade2, fy);
		}
		
		float pnoise(vec2 co, float freq, int steps, float persistence)
		{
		  float value = 0.0;
		  float ampl = 1.0;
		  float sum = 0.0;
		  for(int i=0 ; i<steps ; i++)
		  {
			sum += ampl;
			value += noise(co, freq) * ampl;
			freq *= 2.0;
			ampl *= persistence;
		  }
		  return value / sum;
		}

		void main()
		{
			vec2 uv = vUv;
			float gradient = 1.0 - uv.y;
			float gradientStep = 0.1;
			
			vec2 pos = vUv.xy;
			pos.y -= iTime * 0.3125;
			
			vec4 brighterColor = vec4(1.0, 0.65, 0.1, 1.0);
			vec4 darkerColor = vec4(1.0, 0.0, 0.1, 0.0);
			vec4 middleColor = mix(brighterColor, darkerColor, 0.5);

			float noiseTexel = pnoise(pos, 10.0, 5, 0.5);
			
			float firstStep = smoothstep(0.0, noiseTexel, gradient);
			float darkerColorStep = smoothstep(0.0, noiseTexel, gradient - gradientStep);
			float darkerColorPath = firstStep - darkerColorStep;
			vec4 color = mix(brighterColor, darkerColor, darkerColorPath);

			float middleColorStep = smoothstep(0.0, noiseTexel, gradient - 0.2 * 2.0);
			
			color = mix(color, middleColor, darkerColorStep - middleColorStep);
			color = mix(vec4(0.0), color, firstStep);
			gl_FragColor = color;
		}