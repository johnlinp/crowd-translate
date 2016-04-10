for page in index edit
do
    browserify -t [ babelify --presets [ react ] ] scripts/${page}.js -o static/js/${page}.js
done
