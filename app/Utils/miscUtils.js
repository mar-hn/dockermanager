import ConvertClass from 'ansi-to-html';
import xmlParser from 'xml-js';

class miscUtils
{
    constructor()
    {
        this.convert = new ConvertClass()
    }

    escape(html) 
    {
        const text = document.createTextNode(html);
        const div = document.createElement('div');
        div.appendChild(text);
        return div.innerHTML;
    };    

    ansiToHtml(AnsiText)
    {
        return this.convert.toHtml(AnsiText);
    }

    addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes*60000);
    }    

    getTime(date) 
    {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours %= 12;
        hours = hours === 0 ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        const strTime = `${hours}:${minutes} ${ampm}`;
        return strTime;
    }


    xmlToJs(xml)
    {
        return xmlParser.xml2js(xml,{compact: true});
    }

    escapeRegExp(string) 
    {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}

export default miscUtils;