baseurl='https://awbw.amarriner.com/terrain'

wget_unit () {
  for country in os bm ge yc bh rf gs bd ab js ci pc tg pl ar wn 
  do
    for unit in anti-air apc artillery b-copter battleship blackboat blackbomb bomber carrier cruiser fighter infantry lander md.tank mech megatank missile neotank piperunner recon rocket stealth sub t-copter tank
    do
      wget "$baseurl/$1/$country$unit.gif"
    done
  done
}

for style in aw1 aw2 ani 
do
  wget_unit $style
  mkdir $style
  mv *.gif $style/
done