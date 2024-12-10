// Copyright 2024, University of Colorado Boulder
const fs = require('fs');
/**
 * Parse jsdoc for documentation for a task.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = (file)=>{
    const source = fs.readFileSync(file, {
        encoding: 'utf-8'
    });
    if (source.includes('/**') && source.includes('*/')) {
        const myDoc = source.substring(source.indexOf('/**') + '/**'.length, source.indexOf('*/'));
        const lines = myDoc.split('\n');
        const docLines = lines.map((line)=>line.trim().replace(/^\*\s*/, '')).filter((line)=>line !== '*' && !line.startsWith('@author'));
        // while the first line is empty, remove it
        while(docLines.length > 0 && docLines[0].trim().length === 0){
            docLines.shift();
        }
        // while the last line is empty, remove it
        while(docLines.length > 0 && docLines[docLines.length - 1].trim().length === 0){
            docLines.pop();
        }
        return docLines.join('\n');
    } else {
        return 'No documentation found';
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jb21tb25qcy9nZXREb2N1bWVudGF0aW9uRm9yVGFzay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLyoqXG4gKiBQYXJzZSBqc2RvYyBmb3IgZG9jdW1lbnRhdGlvbiBmb3IgYSB0YXNrLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZmlsZSA9PiB7XG4gIGNvbnN0IHNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYyggZmlsZSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9ICk7XG4gIGlmICggc291cmNlLmluY2x1ZGVzKCAnLyoqJyApICYmIHNvdXJjZS5pbmNsdWRlcyggJyovJyApICkge1xuICAgIGNvbnN0IG15RG9jID0gc291cmNlLnN1YnN0cmluZyggc291cmNlLmluZGV4T2YoICcvKionICkgKyAnLyoqJy5sZW5ndGgsIHNvdXJjZS5pbmRleE9mKCAnKi8nICkgKTtcbiAgICBjb25zdCBsaW5lcyA9IG15RG9jLnNwbGl0KCAnXFxuJyApO1xuICAgIGNvbnN0IGRvY0xpbmVzID0gbGluZXMubWFwKCBsaW5lID0+IGxpbmUudHJpbSgpLnJlcGxhY2UoIC9eXFwqXFxzKi8sICcnICkgKS5maWx0ZXIoIGxpbmUgPT4gbGluZSAhPT0gJyonICYmICFsaW5lLnN0YXJ0c1dpdGgoICdAYXV0aG9yJyApICk7XG5cbiAgICAvLyB3aGlsZSB0aGUgZmlyc3QgbGluZSBpcyBlbXB0eSwgcmVtb3ZlIGl0XG4gICAgd2hpbGUgKCBkb2NMaW5lcy5sZW5ndGggPiAwICYmIGRvY0xpbmVzWyAwIF0udHJpbSgpLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIGRvY0xpbmVzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgLy8gd2hpbGUgdGhlIGxhc3QgbGluZSBpcyBlbXB0eSwgcmVtb3ZlIGl0XG4gICAgd2hpbGUgKCBkb2NMaW5lcy5sZW5ndGggPiAwICYmIGRvY0xpbmVzWyBkb2NMaW5lcy5sZW5ndGggLSAxIF0udHJpbSgpLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIGRvY0xpbmVzLnBvcCgpO1xuICAgIH1cblxuICAgIHJldHVybiBkb2NMaW5lcy5qb2luKCAnXFxuJyApO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiAnTm8gZG9jdW1lbnRhdGlvbiBmb3VuZCc7XG4gIH1cbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJmaWxlIiwic291cmNlIiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJpbmNsdWRlcyIsIm15RG9jIiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImxlbmd0aCIsImxpbmVzIiwic3BsaXQiLCJkb2NMaW5lcyIsIm1hcCIsImxpbmUiLCJ0cmltIiwicmVwbGFjZSIsImZpbHRlciIsInN0YXJ0c1dpdGgiLCJzaGlmdCIsInBvcCIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCxNQUFNQSxLQUFLQyxRQUFTO0FBRXBCOzs7O0NBSUMsR0FDREMsT0FBT0MsT0FBTyxHQUFHQyxDQUFBQTtJQUNmLE1BQU1DLFNBQVNMLEdBQUdNLFlBQVksQ0FBRUYsTUFBTTtRQUFFRyxVQUFVO0lBQVE7SUFDMUQsSUFBS0YsT0FBT0csUUFBUSxDQUFFLFVBQVdILE9BQU9HLFFBQVEsQ0FBRSxPQUFTO1FBQ3pELE1BQU1DLFFBQVFKLE9BQU9LLFNBQVMsQ0FBRUwsT0FBT00sT0FBTyxDQUFFLFNBQVUsTUFBTUMsTUFBTSxFQUFFUCxPQUFPTSxPQUFPLENBQUU7UUFDeEYsTUFBTUUsUUFBUUosTUFBTUssS0FBSyxDQUFFO1FBQzNCLE1BQU1DLFdBQVdGLE1BQU1HLEdBQUcsQ0FBRUMsQ0FBQUEsT0FBUUEsS0FBS0MsSUFBSSxHQUFHQyxPQUFPLENBQUUsVUFBVSxLQUFPQyxNQUFNLENBQUVILENBQUFBLE9BQVFBLFNBQVMsT0FBTyxDQUFDQSxLQUFLSSxVQUFVLENBQUU7UUFFNUgsMkNBQTJDO1FBQzNDLE1BQVFOLFNBQVNILE1BQU0sR0FBRyxLQUFLRyxRQUFRLENBQUUsRUFBRyxDQUFDRyxJQUFJLEdBQUdOLE1BQU0sS0FBSyxFQUFJO1lBQ2pFRyxTQUFTTyxLQUFLO1FBQ2hCO1FBRUEsMENBQTBDO1FBQzFDLE1BQVFQLFNBQVNILE1BQU0sR0FBRyxLQUFLRyxRQUFRLENBQUVBLFNBQVNILE1BQU0sR0FBRyxFQUFHLENBQUNNLElBQUksR0FBR04sTUFBTSxLQUFLLEVBQUk7WUFDbkZHLFNBQVNRLEdBQUc7UUFDZDtRQUVBLE9BQU9SLFNBQVNTLElBQUksQ0FBRTtJQUN4QixPQUNLO1FBQ0gsT0FBTztJQUNUO0FBQ0YifQ==