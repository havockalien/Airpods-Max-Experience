import sizeOf from 'image-size';

const manDims = sizeOf('./motionimages/man_left.png');
const sideDims = sizeOf('./motionimages/max_side.png');
const frontDims = sizeOf('./motionimages/max_front.png');

console.log('Man:', manDims);
console.log('Side:', sideDims);
console.log('Front:', frontDims);
