import Lottie from "react-lottie";

const LoadingSpinner = ({ width, height }: { width?: string; height?: string }) => {
  const loaderOptions = {
    loop: true,
    autoplay: true,
    animationData: json({ w: width?.split("px")?.[0] || 1080, h: height?.split("px")?.[0] || 1080 }),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
  };

  return <Lottie options={loaderOptions} width={width || "120px"} height={height || "120px"} />;
};

export default LoadingSpinner;

const json = ({ w, h }) => ({
  v: "4.8.0",
  meta: {
    g: "LottieFiles AE 3.0.0",
    a: "",
    k: "",
    d: "",
    tc: "",
  },
  fr: 60,
  ip: 0,
  op: 179,
  w: w,
  h: h,
  nm: "1080x1080_Animation Symbol_White",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Layer 2 Outlines",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: {
                x: [0],
                y: [1],
              },
              o: {
                x: [1],
                y: [0],
              },
              t: 5,
              s: [0],
            },
            {
              t: 15,
              s: [100],
            },
          ],
          ix: 11,
        },
        r: {
          a: 0,
          k: 0,
          ix: 10,
        },
        p: {
          a: 0,
          k: [-0.25, 1080.75, 0],
          ix: 2,
        },
        a: {
          a: 0,
          k: [0, 541, 0],
          ix: 1,
        },
        s: {
          a: 1,
          k: [
            {
              i: {
                x: [0, 0, 0],
                y: [1, 1, 1],
              },
              o: {
                x: [1, 1, 1],
                y: [0, 0, 0],
              },
              t: 0,
              s: [50, 50, 100],
            },
            {
              t: 30,
              s: [100, 100, 100],
            },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 149.117],
                    [149.117, 0],
                    [0, -149.117],
                    [-149.117, 0],
                  ],
                  o: [
                    [0, -149.117],
                    [-149.117, 0],
                    [0, 149.117],
                    [149.117, 0],
                  ],
                  v: [
                    [270, 0],
                    [0, -270],
                    [-270, 0],
                    [0, 270],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "fl",
              c: {
                a: 0,
                k: [0, 0, 0, 1],
                ix: 4,
              },
              o: {
                a: 0,
                k: 100,
                ix: 5,
              },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 0,
                k: [270.25, 270.25],
                ix: 2,
              },
              a: {
                a: 0,
                k: [0, 0],
                ix: 1,
              },
              s: {
                a: 0,
                k: [100, 100],
                ix: 3,
              },
              r: {
                a: 0,
                k: 0,
                ix: 6,
              },
              o: {
                a: 0,
                k: 100,
                ix: 7,
              },
              sk: {
                a: 0,
                k: 0,
                ix: 4,
              },
              sa: {
                a: 0,
                k: 0,
                ix: 5,
              },
              nm: "Transform",
            },
          ],
          nm: "Group 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 1800,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Layer 7 Outlines",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: {
                x: [0],
                y: [1],
              },
              o: {
                x: [1],
                y: [0],
              },
              t: 15,
              s: [0],
            },
            {
              t: 25,
              s: [100],
            },
          ],
          ix: 11,
        },
        r: {
          a: 0,
          k: 0,
          ix: 10,
        },
        p: {
          a: 1,
          k: [
            {
              i: {
                x: 0,
                y: 1,
              },
              o: {
                x: 1,
                y: 0,
              },
              t: 10,
              s: [304.831, 775.39, 0],
              to: [10, -10, 0],
              ti: [-10, 10, 0],
            },
            {
              t: 40,
              s: [348.831, 731.39, 0],
            },
          ],
          ix: 2,
        },
        a: {
          a: 0,
          k: [0, 488, 0],
          ix: 1,
        },
        s: {
          a: 1,
          k: [
            {
              i: {
                x: [0, 0, 0],
                y: [1, 1, 1],
              },
              o: {
                x: [1, 1, 1],
                y: [0, 0, 0],
              },
              t: 10,
              s: [80, 80, 100],
            },
            {
              t: 40,
              s: [100, 100, 100],
            },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [105.442, 105.442],
                    [105.442, -105.441],
                  ],
                  o: [
                    [105.442, -105.442],
                    [-105.442, -105.441],
                    [0, 0],
                  ],
                  v: [
                    [138.198, 243.64],
                    [138.198, -138.198],
                    [-243.64, -138.198],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "fl",
              c: {
                a: 0,
                k: [0, 0, 0, 1],
                ix: 4,
              },
              o: {
                a: 0,
                k: 100,
                ix: 5,
              },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 0,
                k: [243.89, 243.889],
                ix: 2,
              },
              a: {
                a: 0,
                k: [0, 0],
                ix: 1,
              },
              s: {
                a: 0,
                k: [100, 100],
                ix: 3,
              },
              r: {
                a: 0,
                k: 0,
                ix: 6,
              },
              o: {
                a: 0,
                k: 100,
                ix: 7,
              },
              sk: {
                a: 0,
                k: 0,
                ix: 4,
              },
              sa: {
                a: 0,
                k: 0,
                ix: 5,
              },
              nm: "Transform",
            },
          ],
          nm: "Group 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 1800,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Layer 3 Outlines",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: {
                x: [0],
                y: [1],
              },
              o: {
                x: [1],
                y: [0],
              },
              t: 15,
              s: [0],
            },
            {
              t: 25,
              s: [100],
            },
          ],
          ix: 11,
        },
        r: {
          a: 0,
          k: 0,
          ix: 10,
        },
        p: {
          a: 1,
          k: [
            {
              i: {
                x: 0,
                y: 1,
              },
              o: {
                x: 1,
                y: 0,
              },
              t: 35,
              s: [802.721, 802.721, 0],
              to: [10, 10, 0],
              ti: [-10, -10, 0],
            },
            {
              t: 70,
              s: [862.721, 862.721, 0],
            },
          ],
          ix: 2,
        },
        a: {
          a: 0,
          k: [243.889, 243.89, 0],
          ix: 1,
        },
        s: {
          a: 1,
          k: [
            {
              i: {
                x: [0.711, 0.711, 0.711],
                y: [1.015, 1.015, 1],
              },
              o: {
                x: [0.379, 0.379, 0.379],
                y: [0, 0, 0],
              },
              t: 10,
              s: [80, 80, 100],
            },
            {
              i: {
                x: [-0.124, -0.124, -0.124],
                y: [1, 1, 1],
              },
              o: {
                x: [0.858, 0.858, 0.858],
                y: [0.074, 0.074, 0],
              },
              t: 15,
              s: [70, 70, 100],
            },
            {
              t: 40,
              s: [100, 100, 100],
            },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [-105.442, 105.442],
                    [105.441, 105.442],
                  ],
                  o: [
                    [105.442, 105.442],
                    [105.441, -105.442],
                    [0, 0],
                  ],
                  v: [
                    [-230.459, 151.378],
                    [151.379, 151.378],
                    [151.379, -230.46],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "fl",
              c: {
                a: 0,
                k: [0, 0, 0, 1],
                ix: 4,
              },
              o: {
                a: 0,
                k: 100,
                ix: 5,
              },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 0,
                k: [230.709, 230.71],
                ix: 2,
              },
              a: {
                a: 0,
                k: [0, 0],
                ix: 1,
              },
              s: {
                a: 0,
                k: [100, 100],
                ix: 3,
              },
              r: {
                a: 0,
                k: 0,
                ix: 6,
              },
              o: {
                a: 0,
                k: 100,
                ix: 7,
              },
              sk: {
                a: 0,
                k: 0,
                ix: 4,
              },
              sa: {
                a: 0,
                k: 0,
                ix: 5,
              },
              nm: "Transform",
            },
          ],
          nm: "Group 1",
          np: 4,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 1800,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "Layer 5 Outlines",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: {
                x: [0],
                y: [1],
              },
              o: {
                x: [1],
                y: [0],
              },
              t: 15,
              s: [0],
            },
            {
              t: 25,
              s: [100],
            },
          ],
          ix: 11,
        },
        r: {
          a: 0,
          k: 0,
          ix: 10,
        },
        p: {
          a: 1,
          k: [
            {
              i: {
                x: 0,
                y: 1,
              },
              o: {
                x: 1,
                y: 0,
              },
              t: 35,
              s: [802.721, 277.279, 0],
              to: [10, -10, 0],
              ti: [-10, 10, 0],
            },
            {
              t: 70,
              s: [862.721, 217.279, 0],
            },
          ],
          ix: 2,
        },
        a: {
          a: 0,
          k: [243.89, 243.889, 0],
          ix: 1,
        },
        s: {
          a: 1,
          k: [
            {
              i: {
                x: [0.711, 0.711, 0.711],
                y: [1.015, 1.015, 1],
              },
              o: {
                x: [0.379, 0.379, 0.379],
                y: [0, 0, 0],
              },
              t: 10,
              s: [80, 80, 100],
            },
            {
              i: {
                x: [-0.124, -0.124, -0.124],
                y: [1, 1, 1],
              },
              o: {
                x: [0.858, 0.858, 0.858],
                y: [0.074, 0.074, 0],
              },
              t: 15,
              s: [70, 70, 100],
            },
            {
              t: 40,
              s: [100, 100, 100],
            },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [105.442, 105.442],
                    [105.442, -105.441],
                  ],
                  o: [
                    [105.442, -105.442],
                    [-105.442, -105.441],
                    [0, 0],
                  ],
                  v: [
                    [151.378, 230.459],
                    [151.378, -151.379],
                    [-230.46, -151.379],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "fl",
              c: {
                a: 0,
                k: [0, 0, 0, 1],
                ix: 4,
              },
              o: {
                a: 0,
                k: 100,
                ix: 5,
              },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 0,
                k: [230.71, 257.07],
                ix: 2,
              },
              a: {
                a: 0,
                k: [0, 0],
                ix: 1,
              },
              s: {
                a: 0,
                k: [100, 100],
                ix: 3,
              },
              r: {
                a: 0,
                k: 0,
                ix: 6,
              },
              o: {
                a: 0,
                k: 100,
                ix: 7,
              },
              sk: {
                a: 0,
                k: 0,
                ix: 4,
              },
              sa: {
                a: 0,
                k: 0,
                ix: 5,
              },
              nm: "Transform",
            },
          ],
          nm: "Group 1",
          np: 4,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 1800,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: "Layer 6 Outlines",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: {
                x: [0],
                y: [1],
              },
              o: {
                x: [1],
                y: [0],
              },
              t: 15,
              s: [0],
            },
            {
              t: 25,
              s: [100],
            },
          ],
          ix: 11,
        },
        r: {
          a: 0,
          k: 0,
          ix: 10,
        },
        p: {
          a: 1,
          k: [
            {
              i: {
                x: 0,
                y: 1,
              },
              o: {
                x: 1,
                y: 0,
              },
              t: 35,
              s: [277.279, 277.279, 0],
              to: [-10, -10, 0],
              ti: [10, 10, 0],
            },
            {
              t: 70,
              s: [217.279, 217.279, 0],
            },
          ],
          ix: 2,
        },
        a: {
          a: 0,
          k: [243.889, 243.89, 0],
          ix: 1,
        },
        s: {
          a: 1,
          k: [
            {
              i: {
                x: [0.711, 0.711, 0.711],
                y: [1.015, 1.015, 1],
              },
              o: {
                x: [0.379, 0.379, 0.379],
                y: [0, 0, 0],
              },
              t: 10,
              s: [80, 80, 100],
            },
            {
              i: {
                x: [-0.124, -0.124, -0.124],
                y: [1, 1, 1],
              },
              o: {
                x: [0.858, 0.858, 0.858],
                y: [0.074, 0.074, 0],
              },
              t: 15,
              s: [70, 70, 100],
            },
            {
              t: 40,
              s: [100, 100, 100],
            },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [105.442, -105.442],
                    [-105.441, -105.442],
                  ],
                  o: [
                    [-105.442, -105.442],
                    [-105.441, 105.442],
                    [0, 0],
                  ],
                  v: [
                    [230.459, -151.378],
                    [-151.379, -151.378],
                    [-151.379, 230.46],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "fl",
              c: {
                a: 0,
                k: [0, 0, 0, 1],
                ix: 4,
              },
              o: {
                a: 0,
                k: 100,
                ix: 5,
              },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 0,
                k: [257.07, 257.07],
                ix: 2,
              },
              a: {
                a: 0,
                k: [0, 0],
                ix: 1,
              },
              s: {
                a: 0,
                k: [100, 100],
                ix: 3,
              },
              r: {
                a: 0,
                k: 0,
                ix: 6,
              },
              o: {
                a: 0,
                k: 100,
                ix: 7,
              },
              sk: {
                a: 0,
                k: 0,
                ix: 4,
              },
              sa: {
                a: 0,
                k: 0,
                ix: 5,
              },
              nm: "Transform",
            },
          ],
          nm: "Group 1",
          np: 4,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 1800,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
});
