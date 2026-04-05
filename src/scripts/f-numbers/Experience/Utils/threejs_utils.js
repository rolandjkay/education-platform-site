/*
 * Functions for creating various useful meshes.
 */
import { Text } from 'troika-three-text'

// Self-hosted font — covers Latin, CJK, Japanese, and most Unicode ranges.
const FONT_URL = '/apps/f-numbers/fonts/NotoSansJP-Medium.ttf';

/*
 * Creates a text mesh using troika-three-text (SDF renderer).
 * Supports all Unicode characters including CJK/Japanese via the hosted font.
 *
 * Parameters match the original TextGeometry-based version.
 */
export function createTextMesh({text, size, depth, rotation, position, color, baseline})
{
    const mesh = new Text();

    mesh.text     = text;
    mesh.font     = FONT_URL;
    // troika fontSize = em-square in world units; multiply by 2.0 so the
    // rendered cap-height is comparable to the previous font, before i18n work.
    mesh.fontSize = size * 2.0;
    mesh.color    = color !== undefined ? color : 0xffffff;

    // anchorX: centre text horizontally on the given position
    mesh.anchorX = 'center';
    // anchorY: 'bottom' places position at the bottom edge of the text (text
    // grows upward); 'middle' centres vertically — matching the old behaviour.
    mesh.anchorY = baseline === 'bottom' ? 'bottom' : 'middle';

    mesh.depthOffset = -1; // Prevent z-fighting with nearby geometry

    if (rotation) {
        mesh.rotation.copy(rotation);
    }
    mesh.position.copy(position);

    mesh.sync();

    return mesh;
}
