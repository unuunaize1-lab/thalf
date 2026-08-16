import { CloudinaryService } from '../src/services/cloudinary.service';

async function runP12Verification() {
  console.log('==================================================');
  console.log('STARTING P1.2 CLOUDINARY MEDIA INFRASTRUCTURE AUDIT');
  console.log('==================================================\n');

  let passedAssertions = 0;
  let totalAssertions = 0;

  function assert(condition: boolean, message: string) {
    totalAssertions++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedAssertions++;
    } else {
      console.error(`  [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Secret leakage check
  console.log('--> Scenario 1: Cloudinary API Secret Exposure');
  assert(!process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET, 'CLOUDINARY_API_SECRET is NOT prefixed with NEXT_PUBLIC_');

  // 2. MIME & Payload validation
  console.log('\n--> Scenario 2: File MIME & Payload Security');
  const validBuffer = Buffer.from('fake_image_bytes_header_test');
  const validRes = CloudinaryService.validateImageFile(validBuffer, 'image/png');
  assert(validRes.valid === true, 'PNG valid image buffer accepted');

  const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const svgRes = CloudinaryService.validateImageFile(svgBuffer, 'image/png');
  assert(svgRes.valid === false && (svgRes.error?.includes('Security violation') ?? false), 'SVG/script injection payload rejected');

  const oversizeBuffer = Buffer.alloc(11 * 1024 * 1024);
  const oversizeRes = CloudinaryService.validateImageFile(oversizeBuffer, 'image/jpeg');
  assert(oversizeRes.valid === false && (oversizeRes.error?.includes('exceeds maximum allowed threshold') ?? false), 'Oversized payload >10MB rejected');

  const exeRes = CloudinaryService.validateImageFile(validBuffer, 'application/octet-stream');
  assert(exeRes.valid === false && (exeRes.error?.includes('Unsupported image format') ?? false), 'Non-image binary extension rejected');

  // 3. Transformation verification
  console.log('\n--> Scenario 3: Cloudinary Responsive Delivery');
  const cdnUrl = 'https://res.cloudinary.com/thalf-cloud/image/upload/v12345/thalf/products/p1/bar.jpg';
  const transformed = CloudinaryService.getTransformedUrl(cdnUrl, { width: 800, height: 600, quality: 'auto' });
  assert(transformed.includes('f_auto,q_auto,w_800,h_600,c_fill'), 'Responsive Cloudinary transformation parameters generated correctly');

  console.log('\n==================================================');
  console.log(`P1.2 AUDIT RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
  console.log('==================================================\n');

  if (passedAssertions === totalAssertions) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runP12Verification().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
