const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const dirToScan = path.join(__dirname, 'src/app');

walkDir(dirToScan, function(filePath) {
    if (filePath.endsWith('.spec.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace jasmine.SpyObj<T> with any
        content = content.replace(/jasmine\.SpyObj<[^>]+>/g, 'any');

        // Replace const spy = jasmine.createSpyObj('Name', ['method1', 'method2']);
        // with const spy = { method1: vi.fn(), method2: vi.fn() };
        content = content.replace(/jasmine\.createSpyObj\([^,]+,\s*\[([^\]]+)\](?:\s*,\s*\{([^\}]+)\})?\s*\)/g, (match, methodsStr, propsStr) => {
            const methods = methodsStr.split(',').map(m => m.trim().replace(/['"]/g, ''));
            let props = [];
            if (propsStr) {
                // simple split assuming no nested objects in props
                props = propsStr.split(',').map(p => p.trim());
            }
            
            let objContent = methods.map(m => `${m}: vi.fn()`);
            if (props.length > 0) {
                objContent = objContent.concat(props);
            }
            return `{ ${objContent.join(', ')} }`;
        });

        // Replace .and.returnValue( with .mockReturnValue(
        content = content.replace(/\.and\.returnValue\(/g, '.mockReturnValue(');

        // Replace toBeFalse() with toBe(false)
        content = content.replace(/\.toBeFalse\(\)/g, '.toBe(false)');

        // Replace toBeTrue() with toBe(true)
        content = content.replace(/\.toBeTrue\(\)/g, '.toBe(true)');

        // Replace spyOn(window, 'confirm') with vi.spyOn(window, 'confirm')
        content = content.replace(/spyOn\(window,\s*'confirm'\)/g, "vi.spyOn(window, 'confirm')");

        // Replace spyOn(component, 'decodeAndStoreRestaurantId') with vi.spyOn(component as any, 'decodeAndStoreRestaurantId')
        content = content.replace(/spyOn\(component,\s*'decodeAndStoreRestaurantId'\)/g, "vi.spyOn(component as any, 'decodeAndStoreRestaurantId')");

        // Fix implicitly any array mockData
        content = content.replace(/const mockData = \[\];/g, "const mockData: any[] = [];");

        if (content !== originalContent) {
            // Need to import vi from vitest if we used vi.fn or vi.spyOn
            if (content.includes('vi.') && !content.includes('import { vi } from')) {
                // Insert after the first import or at top
                content = `import { vi } from 'vitest';\n` + content;
            }

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
