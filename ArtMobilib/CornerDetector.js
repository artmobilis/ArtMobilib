// todo license???

// Corners detection
// detect corners and compute ORB descriptors

// todo: always sort corner 

var CornerDetector = function () {

    /// private data
    var that = this;
    var _smoothed_img;

    /// public data
    this.max_per_level = 100;
    this.blur_size = 5;        // 3 to 9
    this.lap_thres = 30;       // 1 to 100
    this.eigen_thres = 25;     // 1 to 100

    /// private methods
    function DetectKeypoints(img, corners) {
        // detect features
        jsfeat.yape06.laplacian_threshold = that.lap_thres;
        jsfeat.yape06.min_eigen_value_threshold = that.eigen_thres;

        var count = jsfeat.yape06.detect(img, corners, 17);

        // sort by score and reduce the count if needed
        if (count > that.max_per_level) {
            jsfeat.math.qsort(corners, 0, count - 1, function (a, b) { return (b.score < a.score); });
            count = that.max_per_level;
        }

        // calculate dominant orientation for each keypoint
        for (var i = 0; i < count; ++i) {
            corners[i].angle = IC_Angle(img, corners[i].x, corners[i].y);
        }

        return count;
    }

    // central difference using image moments to find dominant orientation
    var u_max = new Int32Array([15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0]);
    function IC_Angle(img, px, py) {
        var half_k = 15; // half patch size
        var m_01 = 0, m_10 = 0;
        var src = img.data, step = img.cols;
        var u = 0, v = 0, center_off = (py * step + px) | 0;
        var v_sum = 0, d = 0, val_plus = 0, val_minus = 0;

        // Treat the center line differently, v=0
        for (u = -half_k; u <= half_k; ++u)
            m_10 += u * src[center_off + u];

        // Go line by line in the circular patch
        for (v = 1; v <= half_k; ++v) {
            // Proceed over the two lines
            v_sum = 0;
            d = u_max[v];
            for (u = -d; u <= d; ++u) {
                val_plus = src[center_off + u + v * step];
                val_minus = src[center_off + u - v * step];
                v_sum += (val_plus - val_minus);
                m_10 += u * (val_plus + val_minus);
            }
            m_01 += v * v_sum;
        }

        return Math.atan2(m_01, m_10);
    }
    
    // check size compatbility
    InitImage = function(img) {
        if (_smoothed_img || _smoothed_img.cols != img.cols || _smoothed_img.rows != img.rows)
            _smoothed_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
    }

    // train a pattern: extract corners multiscale, compute descriptor, store result
    // input should be greyscale image
    this.DetectCorners = function (img, corners, descriptors) {
        InitImage(img);

        jsfeat.imgproc.gaussian_blur(img, _smoothed_img, that.blur_size); // this is more robust
        var corners_num = detect_keypoints(_smoothed_img, corners, that.max_per_level);
        jsfeat.orb.describe(_smoothed_img, corners, corners_num, descriptors);

        console.log("IMtrain " + _smoothed_img.cols + "x" + _smoothed_img.rows + " points: " + corners_num);

        return corners_num;
    };
};
