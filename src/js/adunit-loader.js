
class AdUnitLoader {
    constructor(max_elems, base_content_node_selector, adunit_path_default) {
        this.maxElems = max_elems;
        if(typeof this.maxElems == 'undefined') {
            throw 'max_elems must be defined';
        }
        this.baseContentNodeSelector = base_content_node_selector || 'article.main';
        this.contentDirectChildrenSelector = [this.baseContentNodeSelector, '>*'].join('');
        this.adunitPathDefault = adunit_path_default || '/18190176/AdThrive_Content_1/test';
        this.slot_cache = []
        this.loadNextSlot();
    }
    
    viewableAreaOccupied() {
        //console.log('viewableAreaOccupied');
        var viewable_y_min = window.pageYOffset;
        //console.log(viewable_y_min);
        var viewable_y_max = viewable_y_min + window.innerHeight;
        //console.log(viewable_y_max);
        for(var i=0; i<this.slot_cache.length; i++) {
            var slot = this.slot_cache[i];
            if(slot.y_offset >= viewable_y_min && slot.y_offset <= viewable_y_max) {
                return true;
            }
        }
        return false;
    }
    
    loadViewableArea(adunit_path) {
        //console.log('loadViewableArea')
        adunit_path = adunit_path || this.adunitPathDefault;
        
        var total_checks = 0;
        while(!this.viewableAreaOccupied()) {
            //console.log('loadNextSlot');
            this.loadNextSlot();
            total_checks++;
            if(total_checks > 10) {
                break;
            }
        }
    }
    
    loadAllSlots() {
        for(var i=0; i<this.maxElems; i++) {
            this.loadNextSlot();
        }
    }
    
    loadNextSlot(adunit_path) {
        function _elem_contains_img(elem) {
            var q = elem.querySelector('img');
            if(q != null) {
                return true;
            }
            return false;
        }
        function _prev_elem_is_p(current_index, elements) {
            //console.log('_prev_elem_not_p');
            if(current_index == 0) {
                return false;
            }
            var prev_elem = elements[current_index - 1];
            if(prev_elem.tagName != 'P') {
                return false;
            }
            else if(_elem_contains_img(prev_elem)) {
                //it's not a paragraph if it contains an image
                return false;
            }
            return true;
        }
        function _offset_from_top_of_document(elem) {
            //console.log('_offset_from_top_of_document');
            var offsetTop = 0;
            do {
                if (!isNaN( elem.offsetTop)) {
                    offsetTop += elem.offsetTop;
                }
            } while(elem = elem.offsetParent);
            return offsetTop;
        }
        var elements = document.querySelectorAll(this.contentDirectChildrenSelector);
        //console.log(elements.length);
        var element;
        var last_slot_cache;
        var last_slot_y_offset;
        if(this.slot_cache.length) {
            last_slot_y_offset = this.slot_cache[this.slot_cache.length - 1].y_offset;
        }
        else {
            last_slot_y_offset = -9999;
        }
        
        for(var i=0; i<elements.length; i++) {
            if(this.slot_cache.length == this.maxElems) {
                break;
            }
            element = elements[i];
            //console.log(element.tagName);
            if(element.tagName != 'P') {
                // not eligible to have ad unit be inserted before
                //console.log('not P');
                continue;
            }
            if(!_prev_elem_is_p(i, elements)) {
                //console.log('prev elem not P');
                continue;
            }
            if(_offset_from_top_of_document(element) - last_slot_y_offset < window.innerHeight) {
                //console.log('_offset_from_top_of_document(element) - last_slot_y_offset < window.innerHeight + 250')
                continue;
            }
            var slot_id = ['slot_', this.slot_cache.length + 1].join('');
            var slot_elem = document.createElement('div');
            slot_elem.id = slot_id;
            slot_elem.className = 'ad';
            element.parentElement.insertBefore(slot_elem, element);
            this.slot_cache.push({y_offset: _offset_from_top_of_document(slot_elem), elem: slot_elem});
            //console.log(this.slot_cache);
            this.loadSlot(slot_id);
            break;
        }
    }
    
    loadSlot(id) {
        googletag.cmd.push(() => {
          googletag.display(id);
        });
    }
}